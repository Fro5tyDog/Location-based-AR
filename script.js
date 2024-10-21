let intervalHandles = []; // Array to store interval handles for each entity
let current = { latitude: null, longitude: null };
let target = { latitude: 1.308626683108172, longitude: 103.85004662847754 }; // Default target to "magnemite"
let lastAlpha = 0;
let direction = 0;

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    const dropdownContainer = document.getElementById('dropdown-container');
    const topLeftCircle = document.getElementById('top-left-circle');
    let dropdownVisible = false;
    let selectedIcon = null; // Track the currently selected icon

    // Toggle dropdown visibility on click
    topLeftCircle.addEventListener('click', function () {
        dropdownVisible = !dropdownVisible;
        dropdownContainer.style.display = dropdownVisible ? 'flex' : 'none';
    });

    // Load model positions and create dropdown circles
    fetch('./model_positions.json')
        .then(response => response.json())
        .then(data => {
            console.log('Model data loaded:', data);
            createDropdownCircles(data);
            setDefaultTarget(data); // Set default target to the first model
        })
        .catch(error => {
            console.error('Error loading the JSON data:', error);
        });

    function createDropdownCircles(models) {
        models.forEach((model, index) => {
            const circle = document.createElement('div');
            circle.classList.add('dropdown-circle');

            // Create an image element for the model
            const img = document.createElement('img');
            img.src = `./assets/model_Icons/${model.name.toLowerCase()}.png`; // Assume icons follow model naming
            img.alt = model.name;
            
            // Append image to the circle
            circle.appendChild(img);

            // Add event listener to select model
            circle.addEventListener('click', function () {
                if (circle === selectedIcon) {
                    // Deselect if the same icon is clicked again
                    circle.classList.remove('selected');
                    selectedIcon = null;
                    console.log(`Deselected model: ${model.name}`);
                } else {
                    // Deselect the previous icon, if any
                    if (selectedIcon) {
                        selectedIcon.classList.remove('selected');
                    }
                    // Select the new icon and update target
                    circle.classList.add('selected');
                    selectedIcon = circle;
                    console.log(`Selected model: ${model.name}`);

                    // Update the target to point to the selected model's coordinates
                    target.latitude = model.location.lat;
                    target.longitude = model.location.lng;
                }
            });

            // Append the circle to the dropdown container
            dropdownContainer.appendChild(circle);
        });
    }

    // Set the default target to the first model in the JSON data
    function setDefaultTarget(models) {
        if (models.length > 0) {
            target.latitude = models[0].location.lat;
            target.longitude = models[0].location.lng;
            console.log(`Default target set to ${models[0].name} at (${target.latitude}, ${target.longitude})`);
        }
    }

    scene.addEventListener('loaded', function () {
        console.log('A-Frame scene fully initialized');
        initializeMyApp();
    });
});  

function initializeMyApp() {
    console.log('Initializing the app...');

    // Fetch the model positions from the JSON file
    fetch('./model_positions.json')  // Update with the correct path to your JSON file
        .then(response => response.json())
        .then(data => {
            console.log('Places loaded: ', data);
            getPlayerPosition((playerPosition) => {
                if (playerPosition) {
                    const closestModel = getClosestModel(playerPosition, data);
                    // Update the text with the closest model's name
                    const locationText = document.getElementById('closest-location');
                    locationText.innerHTML = `Closest model: ${closestModel.name}`;
                    console.log(`Closest model is: ${closestModel.name}`);
                }
            });
            renderPlaces(data);  // Pass the fetched data to renderPlaces
        })
        .catch(error => {
            console.error('Error loading the JSON data:', error);
        });

    // Start geolocation and compass
    navigator.geolocation.watchPosition(setCurrentPosition, null, { enableHighAccuracy: true });
    if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
        window.addEventListener("deviceorientationabsolute", runCalculation);
    }

    updateUI();
}

function setCurrentPosition(position) {
    current.latitude = position.coords.latitude;
    current.longitude = position.coords.longitude;
}

function runCalculation(event) {
    var alpha = Math.abs(360 - event.webkitCompassHeading) || event.alpha;
    if (alpha == null || Math.abs(alpha - lastAlpha) > 1) {
        var lat1 = current.latitude * (Math.PI / 180);
        var lon1 = current.longitude * (Math.PI / 180);
        var lat2 = target.latitude * (Math.PI / 180);
        var lon2 = target.longitude * (Math.PI / 180);

        // calculate compass direction
        var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        var bearing = Math.atan2(y, x) * (180 / Math.PI);

        direction = (alpha + bearing + 360) % 360;
        direction = direction.toFixed(0);

        lastAlpha = alpha;
    }
}

function updateUI() {
    const arrow = document.querySelector(".arrow");
    arrow.style.transform = `translate(-50%, -50%) rotate(${direction}deg)`;
    requestAnimationFrame(updateUI);
}

function getClosestModel(playerPosition, models) {
    let closestModel = null;
    let shortestDistance = Infinity;

    models.forEach(model => {
        const distance = calculateDistance(playerPosition.latitude, playerPosition.longitude, model.location.lat, model.location.lng);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestModel = model;
        }
    });

    return closestModel;
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');
    console.log('Rendering places...');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        let filePath = place.filePath;
        let visibilityRange = place.visibilityRange;

        console.log(`Creating model for: ${place.name} at (${latitude}, ${longitude}) with visibility range [${visibilityRange.min}m - ${visibilityRange.max}m]`);

        let model = document.createElement('a-entity');
        model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        model.setAttribute('gltf-model', `${filePath}`);
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1.1; clampWhenFinished: true; crossFadeDuration: 0.3');
        model.setAttribute('look-at', '[gps-camera]');
        model.setAttribute('scale', '0.15 0.15 0.15'); 
        model.setAttribute('visible', 'false'); 

        model.addEventListener('model-loaded', () => {
            console.log(`${place.name} model loaded, now visible.`);
            model.setAttribute('visible', 'true');
        });

        scene.appendChild(model);
    });
}

// Function to calculate distance between two GPS coordinates (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}
