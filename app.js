window.onload = () => {
    let places = staticLoadPlaces();
    return renderPlaces(places);
};

function staticLoadPlaces() {
    return [
        {
            name: "LTA",
            location: {
                lat: 1.30827,
                lng: 103.84929
            }
        }
    ];
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');  // Selects the A-frame scene in the HTML

    places.forEach((place) => {  // Loops over each place (currently only one place)
        const latitude = place.location.lat;  // Extracts the latitude of the place
        const longitude = place.location.lng;  // Extracts the longitude of the place

        // Create an A-frame entity for the 2D image
        const image = document.createElement('a-image');
        image.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);  // Sets the location
        image.setAttribute('src', "#image-asset");  // Loads the image from assets (defined in index.html)
        image.setAttribute('look-at', '[gps-camera]');  // Ensures the image always faces the user
        // image.setAttribute('rotation', '0 0 0');
        image.setAttribute('side', 'double');
        image.setAttribute('scale', '10 10 1');  // Adjusts the size of the image

        // This part dispatches an event once the GPS-based entity is loaded (optional for debugging)
        image.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        // Add click listener to the image (for future interactivity)
        const clickListener = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            console.log('Image clicked');  // Logs 'Image clicked' when the image is clicked
        };
        image.addEventListener('click', clickListener);  // Attach the click listener to the image

        scene.appendChild(image);  // Adds the image to the A-frame scene
    });
}



// window.onload = () => {
//     let places = staticLoadPlaces();
//     return renderPlaces(places);
// };

// function staticLoadPlaces() {
//     return [
//         {
//             name: "LTA",
//             location: {
//                 lat: 1.30877,
//                 lng: 103.84863
//             }
//         }
//     ];
// }

// function renderPlaces(places) {
//     let scene = document.querySelector('a-scene');  // Selects the A-frame scene in the HTML

//     places.forEach((place) => {  // Loops over each place (currently only one place)
//         const latitude = place.location.lat;  // Extracts the latitude of the place
//         const longitude = place.location.lng;  // Extracts the longitude of the place

//         // Create an A-frame entity for the 3D model
//         const icon = document.createElement('a-entity');
//         icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);  // Sets the location
//         icon.setAttribute('gltf-model', "#cube-asset");  // Sets the 3D model to be loaded (defined in index.html)
//         icon.setAttribute('look-at', '[gps-camera]'); // Ensures object always faces you. 
//         icon.setAttribute('scale', '15 15 15');  // Sets the scale of the 3D model so it is visible

//         // This part dispatches an event once the GPS-based entity is loaded (optional for debugging)
//         icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

//         // Add click listener to the model (for future interactivity)
//         const clickListener = function (ev) {
//             ev.stopPropagation();
//             ev.preventDefault();
//             console.log('Clicked');  // Logs 'Clicked' when the model is clicked
//         };
//         icon.addEventListener('click', clickListener);  // Attach the click listener to the model

//         scene.appendChild(icon);  // Adds the 3D model to the A-frame scene
//     });
// }
