fetch('config.json')
  .then(response => response.json())
  .then(config => {
    const scene = document.querySelector('a-scene');
    const locationSelector = document.getElementById('locationSelector');

    // Dynamically add models and images based on the configuration
    config.locations.forEach(location => {
      location['3dModels'].forEach(model => {
        const modelEntity = document.createElement('a-entity');
        modelEntity.setAttribute('gltf-model', `url(${model})`);
        modelEntity.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);
        modelEntity.setAttribute('scale', '0.5 0.5 0.5');
        scene.appendChild(modelEntity);
      });

      location['2dImages'].forEach(image => {
        const imageEntity = document.createElement('a-image');
        imageEntity.setAttribute('src', image);
        imageEntity.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);
        imageEntity.setAttribute('scale', '20 20 20');
        scene.appendChild(imageEntity);
      });

      // Populate the location selector
      const option = document.createElement('option');
      option.value = location.id;
      option.text = `Location: ${location.id}`;
      locationSelector.appendChild(option);
    });

    // Minimap and user marker
    const minimap = document.getElementById('minimap');
    const userMarker = document.createElement('div');
    userMarker.style.width = '10px';
    userMarker.style.height = '10px';
    userMarker.style.background = 'red';
    userMarker.style.position = 'absolute';
    userMarker.style.borderRadius = '50%';
    minimap.appendChild(userMarker);

    navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      userMarker.style.top = `${latitude * 2}px`;  // Scale to fit minimap
      userMarker.style.left = `${longitude * 2}px`;  // Scale to fit minimap
    });

    // Handle directional arrow
    function calculateDirection(userLat, userLon, targetLat, targetLon) {
      const y = Math.sin(targetLon - userLon) * Math.cos(targetLat);
      const x = Math.cos(userLat) * Math.sin(targetLat) - Math.sin(userLat) * Math.cos(targetLat) * Math.cos(targetLon - userLon);
      const bearing = Math.atan2(y, x) * (180 / Math.PI);
      return (bearing + 360) % 360;
    }

    const arrowElement = document.getElementById('arrow');

    locationSelector.addEventListener('change', function (event) {
      const selectedLocation = config.locations.find(location => location.id === event.target.value);

      navigator.geolocation.watchPosition((position) => {
        const direction = calculateDirection(
          position.coords.latitude,
          position.coords.longitude,
          selectedLocation.latitude,
          selectedLocation.longitude
        );

        arrowElement.style.transform = `translateX(-50%) rotate(${direction}deg)`;
      });
    });
  });
