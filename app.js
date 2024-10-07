fetch('config.json')
  .then(response => response.json())
  .then(config => {
    const scene = document.querySelector('a-scene');
    const location = config.location;  // Only handling one location for now

    // Dynamically add the 3D model based on the configuration
    if (location['3dModel']) {
      const modelEntity = document.createElement('a-entity');
      modelEntity.setAttribute('gltf-model', `src: ${location['3dModel']}`);
      modelEntity.setAttribute('gps-entity-place', `latitude: ${location.latitude}; longitude: ${location.longitude};`);
      modelEntity.setAttribute('scale', '100 100 100');
      scene.appendChild(modelEntity);
    }
  });
