document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('uiCanvas');
    const ctx = canvas.getContext('2d');

    // Load images for the UI circles
    const img3DModels = new Image();
    img3DModels.src = './assets/ui_Images/3dModels.png';

    const imgMapIcon = new Image();
    imgMapIcon.src = './assets/ui_Images/mapIcon.png';

    let dropdownCircles = [];
    let arrowRotation = 0; // Rotation for arrow
    let closestModelName = 'None'; // Closest model text
    let modelsData = []; // Holds the model data for dropdown and rendering

    // Function to resize the canvas and retain the window dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawUI(); // Redraw the UI whenever the canvas resizes
    }

    // Attach resize event listener to window and immediately resize the canvas
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Set the initial size

    // Draw UI on the canvas
    function drawUI() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

        // Draw top-left circle (3D Models)
        ctx.beginPath();
        ctx.arc(50, 50, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(img3DModels, 25, 25, 50, 50);

        // Draw center circle (with rotating arrow)
        ctx.beginPath();
        ctx.arc(200, 150, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#0ee85e';
        ctx.fill();
        ctx.stroke();

        // Draw the rotating arrow
        ctx.save();
        ctx.translate(200, 150); // Move to center of circle
        ctx.rotate(arrowRotation * Math.PI / 180); // Rotate arrow
        ctx.beginPath();
        ctx.moveTo(0, -30); // Arrow tip
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fillStyle = '#ff0000';
        ctx.fill();
        ctx.restore();

        // Draw top-right circle (Map Icon)
        ctx.beginPath();
        ctx.arc(350, 50, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.stroke();
        ctx.drawImage(imgMapIcon, 325, 25, 50, 50);

        // Draw closest model text
        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(`Closest model: ${closestModelName}`, 200, 240);

        // Draw dropdown circles
        drawDropdown(modelsData); // Ensure dropdown circles are drawn
    }

    // Draw dropdown circles dynamically
    function drawDropdown(models) {
        ctx.clearRect(0, 250, canvas.width, 50); // Clear dropdown area
        models.forEach((model, index) => {
            const x = 60 + index * 60;
            const y = 270;
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.stroke();

            const img = new Image();
            img.src = `./assets/model_Icons/${model.name.toLowerCase()}.png`; // Make sure this path is correct
            img.onload = () => {
                ctx.drawImage(img, x - 20, y - 20, 40, 40);
            };

            dropdownCircles.push({ x, y, radius: 25, model });
        });
    }

    // Detect clicks on the canvas for dropdown selections
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        dropdownCircles.forEach(circle => {
            const dx = mouseX - circle.x;
            const dy = mouseY - circle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < circle.radius) {
                console.log(`Clicked model: ${circle.model.name}`);
                updateUI(45, circle.model.name); // Rotate arrow and update closest model
            }
        });
    });

    // Function to update the UI (rotating the arrow, updating the closest model text)
    function updateUI(rotation, modelName) {
        arrowRotation = rotation;
        closestModelName = modelName;
        drawUI();
    }

    // Function to fetch and load models
    function loadModels() {
        fetch('./model_positions.json')
            .then(response => response.json())
            .then(data => {
                modelsData = data; // Store model data
                drawDropdown(data); // Draw dropdown circles dynamically
                renderPlaces(data); // Render 3D models in the scene
            })
            .catch(error => console.error('Error loading models:', error));
    }

    // Function to render 3D models in the scene
    function renderPlaces(places) {
        let scene = document.querySelector('a-scene');
        console.log('Rendering places...');

        places.forEach((place) => {
            let latitude = place.location.lat;
            let longitude = place.location.lng;
            let filePath = place.filePath;
            let visibilityRange = place.visibilityRange;
            let name = place.name;

            console.log(`Creating model for: ${place.name} at (${latitude}, ${longitude})`);

            let model = document.createElement('a-entity');
            model.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            model.setAttribute('gltf-model', `${filePath}`);
            model.setAttribute('rotation', '0 0 0');
            model.setAttribute('animation-mixer', 'clip: *; loop: repeat; timeScale: 1.1; clampWhenFinished: true; crossFadeDuration: 0.3');
            model.setAttribute('look-at', '[gps-camera]');
            model.setAttribute('scale', '0.15 0.15 0.15'); // Initial scale
            model.setAttribute('visible', 'false');

            model.addEventListener('model-loaded', () => {
                console.log(`${place.name} model loaded, now visible.`);
                model.setAttribute('visible', 'true');
                model.classList.add(`${place.name}`);
            });

            scene.appendChild(model);
            updateModelVisibility(name, model, latitude, longitude, visibilityRange);
        });
    }

    // Function to calculate and update model visibility
    function updateModelVisibility(name, model, latitude, longitude, visibilityRange) {
        getPlayerPosition((playerPosition) => {
            const distance = calculateDistance(playerPosition.latitude, playerPosition.longitude, latitude, longitude);
            if (distance > visibilityRange.min && distance < visibilityRange.max) {
                model.setAttribute('visible', 'true');
            } else {
                model.setAttribute('visible', 'false');
            }
        });
        requestAnimationFrame(() => updateModelVisibility(name, model, latitude, longitude, visibilityRange));
    }

    // GPS position simulation and distance calculation (unchanged)
    function getPlayerPosition(callback) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => callback({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                (error) => callback(null),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        } else {
            callback(null);
        }
    }

    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3;
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }

    // Initialize everything after DOM is loaded
    img3DModels.onload = () => {
        imgMapIcon.onload = () => {
            drawUI(); // Initial draw of UI
        };
    };
    
    loadModels(); // Load the model data
});
