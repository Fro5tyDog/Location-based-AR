window.onload = () => {
    let places = staticLoadPlaces();
    return renderPlaces(places);
};

function staticLoadPlaces() {
    return [
        {
            name: "LTA",
            location: {
                lat: 1.30877,
                lng: 103.84863
            }
        }
    ];
}

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');  // Selects the A-frame scene in the HTML

    places.forEach((place) => {  // Loops over each place (currently only one place)
        const latitude = place.location.lat;  // Extracts the latitude of the place
        const longitude = place.location.lng;  // Extracts the longitude of the place

        // Create an A-frame entity for the 3D model
        const icon = document.createElement('a-entity');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);  // Sets the location
        icon.setAttribute('gltf-model', "#cube-asset");  // Sets the 3D model to be loaded (defined in index.html)
        icon.setAttribute('scale', '15 15 15');  // Sets the scale of the 3D model so it is visible

        // This part dispatches an event once the GPS-based entity is loaded (optional for debugging)
        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        // Add click listener to the model (for future interactivity)
        const clickListener = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            console.log('Clicked');  // Logs 'Clicked' when the model is clicked
        };
        icon.addEventListener('click', clickListener);  // Attach the click listener to the model

        scene.appendChild(icon);  // Adds the 3D model to the A-frame scene
    });
}


    // function renderPlaces(places) {
    //     let scene = document.querySelector('a-scene');
    //     places.forEach((place) => {
    //         const latitude = place.location.lat;
    //         const longitude = place.location.lng;
    //         // add place icon
    //         const icon = document.createElement('a-entity');
    //         icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
    //         icon.setAttribute('gltf-model', "#cube-asset");
    //         // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
    //         icon.setAttribute('scale', '15 15 15');
    //         icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
    //         const clickListener = function (ev) {
    //            ev.stopPropagation();
    //             ev.preventDefault();
    //             console.log('Clicked');
    //             const name = ev.target.getAttribute('name');
    //             const el = ev.detail.intersection && ev.detail.intersection.object.el;
    //             if (el && el === ev.target) {
    //                 const label = document.createElement('span');
    //                 const container = document.createElement('div');
    //                 container.setAttribute('id', 'place-label');
    //                 label.innerText = name;
    //                 container.appendChild(label);
    //                 document.body.appendChild(container);
    //                 setTimeout(() => {
    //                     container.parentElement.removeChild(container);
    //                 }, 1500);
    //             }
    //         };
    //         icon.addEventListener('click', clickListener);
    //         scene.appendChild(icon);
    //     });
