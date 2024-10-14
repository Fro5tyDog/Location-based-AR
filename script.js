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
            filePath: './assets/magnemite/scene.gltf',
            location: { 
                lat: 1.3087085765187283,
                lng: 103.85002403454892,
            },
            visibilityRange: { min: 10, max: 100 }, // Appear when within 10-100m
        },
        {
            name: 'Dragonite',
            filePath: './assets/dragonite/scene.gltf',
            location: { 
                lat: 1.306656407996899,
                lng: 103.85012141436107,
            },
            visibilityRange: { min: 10, max: 150 }, // Custom distance range
        },
    ];
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    places.forEach((place) => {
        let latitude = place.location.lat;
        let longitude = place.location.lng;
        let filePath = place.filePath;
        let visibilityRange = place.visibilityRange; // Access visibility range
        
        // Create a new entity for each place
        let model = document.createElement('a-entity');
        model.setAttribute('gltf-model', `${filePath}`);
        model.setAttribute('rotation', '0 0 0');
        model.setAttribute('animation-mixer', '');
        model.setAttribute('scale', '0.15 0.15 0.15'); // Initial scale
        model.setAttribute('visible', 'false'); // Initially hidden
        
        // Append the model to the scene
        scene.appendChild(model);

        // Update visibility based on player's distance
        model.setAttribute('gps-entity-place', {
            latitude: latitude,
            longitude: longitude,
        });

        model.addEventListener('gps-entity-place-update-position', (event) => {
            let playerLat = event.detail.position.latitude;
            let playerLng = event.detail.position.longitude;
            let distance = calculateDistance(playerLat, playerLng, latitude, longitude);
            
            if (distance > visibilityRange.min && distance < visibilityRange.max) {
                model.setAttribute('visible', 'true'); // Show the model
                console.log("Model is shown");
            } else {
                model.setAttribute('visible', 'false'); // Hide the model
                console.log("Model is hidden");
            }
        });
    });
}

// Function to calculate distance between two GPS coordinates (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
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
    return distance;
}
