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

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

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

