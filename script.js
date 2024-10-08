document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    scene.addEventListener('loaded', function () {
        console.log('A-Frame scene fully initialized');
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
                lat: 1.3087085765187283,
                lng: 103.85002403454892,
            }
        },
    ];
}

let model = null; // Store the model globally so it's only created once

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;

        // Create the model only once if it doesn't exist
        if (model === null) {
            model = document.createElement('a-entity');
            model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            model.setAttribute('gltf-model', './assets/magnemite/scene.gltf');
            model.setAttribute('rotation', '0 0 0');
            model.setAttribute('animation-mixer', '');
            model.setAttribute('scale', '0.15 0.15 0.15'); // Initial scale

            // Event listener for when the model is fully loaded
            model.addEventListener('loaded', () => {
                window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'));
                console.log('Model loaded and added to scene');
            });

            // Append the model to the scene
            scene.appendChild(model);
        }
    });
}
