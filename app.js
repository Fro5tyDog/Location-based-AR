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
        let scene = document.querySelector('a-scene');
        places.forEach((place) => {
            const latitude = place.location.lat;
            const longitude = place.location.lng;
            // add place icon
            const icon = document.createElement('a-entity');
            icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
            icon.setAttribute('gltf-model', "#cube-asset");
            // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
            icon.setAttribute('scale', '15 15 15');
            icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));
            const clickListener = function (ev) {
               ev.stopPropagation();
                ev.preventDefault();
                console.log('Clicked');
                const name = ev.target.getAttribute('name');
                const el = ev.detail.intersection && ev.detail.intersection.object.el;
                if (el && el === ev.target) {
                    const label = document.createElement('span');
                    const container = document.createElement('div');
                    container.setAttribute('id', 'place-label');
                    label.innerText = name;
                    container.appendChild(label);
                    document.body.appendChild(container);
                    setTimeout(() => {
                        container.parentElement.removeChild(container);
                    }, 1500);
                }
            };
            icon.addEventListener('click', clickListener);
            scene.appendChild(icon);
        });
}