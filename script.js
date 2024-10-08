document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        console.log('A-Frame scene fully initialized');
        // Place your code here that should run after A-Frame is initialized
        initializeMyApp();
    });
});

function initializeMyApp() {
    let places = staticLoadPlaces();
    renderPlaces(places);
}

function staticLoadPlaces() {
    return [
        {
            name: 'Magnemite',
            location: {
                lat: 1.3088672819001088,
                lng: 103.84988767889077,
            }
        },
    ];
}

let previousLocation = { lat: null, lng: null };
const updateThreshold = 0.0001; // Adjust the threshold to control the sensitivity (e.g., ~11 meters)

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // Check if the GPS location has changed significantly
        if (previousLocation.lat !== null && previousLocation.lng !== null) {
            const distance = Math.sqrt(
                Math.pow(latitude - previousLocation.lat, 2) + 
                Math.pow(longitude - previousLocation.lng, 2)
            );
            if (distance < updateThreshold) {
                console.log("GPS change is too small, skipping update.");
                return; // Skip updating if the GPS change is below the threshold
            }
        }

        // Store new location as previous location
        previousLocation = { lat: latitude, lng: longitude };

        // Create the model entity
        let model = document.createElement('a-entity');
        model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);

        // Set the model's attributes after a slight delay
        setTimeout(() => {
            model.setAttribute('gltf-model', './assets/magnemite/scene.gltf');
            model.setAttribute('rotation', '0 180 0');
            model.setAttribute('animation-mixer', '');
            model.setAttribute('scale', '0.15 0.15 0.15');
        }, 100);

        // Create and append the camera inside the model entity
        let camera = document.createElement('a-camera');
        camera.setAttribute('gps-camera', '');
        camera.setAttribute('rotation-reader', '');

        // Append the camera to the model entity
        model.appendChild(camera);

        // Event listener for when the model is fully loaded
        model.addEventListener('loaded', () => {
            window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
            console.log('Entity and camera loaded');
        });

        // Append the model to the scene
        scene.appendChild(model);
    });
}

