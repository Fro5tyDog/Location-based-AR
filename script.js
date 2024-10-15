let intervalHandles = []; // Array to store interval handles for each entity

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    const dropdownContainer = document.getElementById('dropdown-container');
    const topLeftCircle = document.getElementById('top-left-circle');
    const arrowElement = document.querySelector('.circle-center img'); // Target the arrow image
    const locationText = document.getElementById('closest-location'); // Target the text below the arrow
    let dropdownVisible = false;
    let selectedIcon = null; // Track the currently selected icon
    let selectedModel = null; // Track the currently selected model
    let models = []; // To store the loaded models
    let previousDistance = 0; // Track the previous distance for updating every 10 meters
    
    // Toggle dropdown visibility on click
    topLeftCircle.addEventListener('click', function () {
        dropdownVisible = !dropdownVisible;
        dropdownContainer.style.display = dropdownVisible ? 'flex' : 'none';
    });

    // Load model positions and create dropdown circles
    fetch('./model_positions.json')
        .then(response => response.json())
        .then(data => {
            models = data;
            console.log('Model data loaded:', data);
            createDropdownCircles(data);
        })
        .catch(error => {
            console.error('Error loading the JSON data:', error);
        });

    function createDropdownCircles(models) {
        models.forEach((model) => {
            const circle = document.createElement('div');
            circle.classList.add('dropdown-circle');

            // Create an image element for the model
            const img = document.createElement('img');
            img.src = `./assets/model_Icons/${model.name.toLowerCase()}.png`; // Assume icons follow model naming
            img.alt = model.name;
            
            // Append image to the circle
            circle.appendChild(img);

            // Add event listener to select or de-select model
            circle.addEventListener('click', function () {
                if (circle === selectedIcon) {
                    // Deselect if the same icon is clicked again
                    circle.classList.remove('selected');
                    selectedIcon = null;
                    selectedModel = null;
                    console.log(`Deselected model: ${model.name}`);
                } else {
                    // Deselect the previous icon, if any
                    if (selectedIcon) {
                        selectedIcon.classList.remove('selected');
                    }
                    // Select the new icon
                    circle.classList.add('selected');
                    selectedIcon = circle;
                    selectedModel = model; // Set the selected model
                    console.log(`Selected model: ${model.name}`);
                }
            });

            // Append the circle to the dropdown container
            dropdownContainer.appendChild(circle);
        });
    }

    // Function to calculate bearing (direction) between two coordinates
    function calculateBearing(lat1, lng1, lat2, lng2) {
        const toRadians = (deg) => deg * Math.PI / 180;
        const toDegrees = (rad) => rad * 180 / Math.PI;

        const phi1 = toRadians(lat1);
        const phi2 = toRadians(lat2);
        const deltaLambda = toRadians(lng2 - lng1);

        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
                Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        const bearing = toDegrees(Math.atan2(y, x));
        return (bearing + 360) % 360; // Normalize to 0-360 degrees
    }

    // Function to get the closest model to the player's current location
    function getClosestModel(playerPosition) {
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

    // Function to update the arrow direction
    function updateArrowDirection(playerPosition) {
        const modelToTarget = selectedModel || getClosestModel(playerPosition);
        if (modelToTarget) {
            const bearing = calculateBearing(
                playerPosition.latitude,
                playerPosition.longitude,
                modelToTarget.location.lat,
                modelToTarget.location.lng
            );
            arrowElement.style.transform = `rotate(${bearing}deg)`; // Rotate the arrow
            console.log(`Arrow pointing to ${modelToTarget.name} at bearing: ${bearing} degrees`);

            // Update the location text
            updateLocationText(playerPosition, modelToTarget);
        }
    }

    // Function to update the text with model name and distance
    function updateLocationText(playerPosition, model) {
        const distance = calculateDistance(
            playerPosition.latitude,
            playerPosition.longitude,
            model.location.lat,
            model.location.lng
        );
        
        const roundedDistance = Math.floor(distance / 10) * 10; // Round to nearest 10 meters
        
        // Only update the text if the distance has changed by 1 meter
        if (Math.abs(roundedDistance - previousDistance) >= 1) {
            locationText.innerHTML = `Currently tracking: ${model.name} - ${roundedDistance} meters away.`;
            previousDistance = roundedDistance;
        }  
    }

    // Constantly check the player's position and update the arrow direction
    setInterval(() => {
        getPlayerPosition((playerPosition) => {
            if (playerPosition) {
                updateArrowDirection(playerPosition);
            } else {
                console.error('Player position could not be retrieved.');
            }
        });
    }, 500); // Update every 500 milliseconds for faster responsiveness

    scene.addEventListener('loaded', function () {
        console.log('A-Frame scene fully initialized');
        initializeMyApp();
    });
});



function initializeMyApp() {
    console.log('Initializing the app...');

    console.log('Initializing the app...');

    // Fetch the model positions from the JSON file
    fetch('./model_positions.json')  // Update with the correct path to your JSON file
        .then(response => response.json())
        .then(data => {
            console.log('Places loaded: ', data);
            renderPlaces(data);  // Pass the fetched data to renderPlaces
        })
        .catch(error => {
            console.error('Error loading the JSON data:', error);
        });
    
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

        // Create a new entity for each place
        let model = document.createElement('a-entity');
        model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        model.setAttribute('gltf-model', `${filePath}`);
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1.1; clampWhenFinished: true; crossFadeDuration: 0.3');
        model.setAttribute('look-at', '[gps-camera]');
        model.setAttribute('scale', '0.15 0.15 0.15'); // Initial scale
        model.setAttribute('visible', 'false'); // Initially hidden

        // Wait for the model to fully load before making it visible
        model.addEventListener('model-loaded', () => {
            console.log(`${place.name} model loaded, now visible.`);
            model.setAttribute('visible', 'true');
        });

        // Append the model to the scene
        scene.appendChild(model);

        // Set up an interval to constantly check the player's distance and update visibility
        let intervalId = setInterval(() => {
            console.log('Checking player position...');
            getPlayerPosition((playerPosition) => {
                if (playerPosition) {
                    let distance = calculateDistance(playerPosition.latitude, playerPosition.longitude, latitude, longitude);
                    console.log(`Distance to ${place.name}: ${distance}m`);

                    // Check if the player is within the visibility range
                    if (distance > visibilityRange.min && distance < visibilityRange.max) {
                        console.log(`${place.name} is within range, showing model.`);
                        model.setAttribute('visible', 'true'); // Show the model
                    } else {
                        console.log(`${place.name} is out of range or too close, hiding model.`);
                        model.setAttribute('visible', 'false'); // Hide the model
                    }
                } else {
                    console.error('Player position could not be retrieved.');
                }
            });
        }, 1000); // Check every 1 second

        // Store the interval handle so we can clear it later
        intervalHandles.push(intervalId);
    });
}


// Function to clear all intervals when removing entities
function clearAllIntervals() {
    intervalHandles.forEach(intervalId => clearInterval(intervalId));
    intervalHandles = []; // Clear the stored handles
}

// Simulate fetching the player's GPS position (real GPS is handled in getPlayerPosition)
function getPlayerPosition(callback) {
    if ("geolocation" in navigator) {
        console.log('Fetching player position using GPS...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Player's current position: Latitude: ${latitude}, Longitude: ${longitude}`);
                callback({ latitude, longitude });
            },
            (error) => {
                console.error('Error retrieving player position', error);
                callback(null); // Handle error (e.g., no permission or GPS unavailable)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 10000, // Cache position for 10 seconds
                timeout: 5000 // Wait up to 5 seconds for a response
            }
        );  
    } else {
        console.error('Geolocation not available in this browser.');
        callback(null); // Handle case when Geolocation is not supported
    }
}

// Function to calculate distance between two GPS coordinates (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
    console.log(`Calculating distance between (${lat1}, ${lng1}) and (${lat2}, ${lng2})`);
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    console.log(`Calculated distance: ${distance} meters`);
    return distance;
}
