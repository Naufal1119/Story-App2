import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

const MAP_STYLE_URL = 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7';

const MapUtil = {
  _maps: {}, // Store map instances by container ID
  _markers: {}, // Store markers by container ID

  createMap(containerId, center = [106.8456, -6.2088], zoom = 12) {
    if (this._maps[containerId]) {
      this.removeMap(containerId);
    }
    
    const map = new maplibregl.Map({
      container: containerId,
      style: MAP_STYLE_URL,
      center: center,
      zoom: zoom
    });

    map.on('load', () => {
      // Add navigation control
      map.addControl(new maplibregl.NavigationControl());
      // Add layer control
      this._addLayerControl(map);
    });
    
    this._maps[containerId] = map;
    this._markers[containerId] = [];
    return map;
  },

  removeMap(containerId) {
    if (this._maps[containerId]) {
      // Remove all markers first
      this._markers[containerId].forEach(marker => marker.remove());
      this._markers[containerId] = [];
      
      // Then remove the map
      this._maps[containerId].remove();
      delete this._maps[containerId];
    }
  },

  addMarker(map, lngLat, options = {}) {
    const marker = new maplibregl.Marker(options)
      .setLngLat(lngLat)
      .addTo(map);
    return marker;
  },

  addPopup(marker, content) {
    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(content);
      
    if (marker) {
      marker.setPopup(popup);
    }
    return popup;
  },

  addMarkersWithStories(map, stories, containerId) {
    // Clear existing markers
    this._markers[containerId].forEach(marker => marker.remove());
    this._markers[containerId] = [];

    // Add markers for stories with location
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = this.addMarker(map, [story.lon, story.lat]);
        
        // Create popup with photo and story info
        const popup = this.addPopup(marker, `
          <div class="marker-popup">
            <img src="${story.photoUrl}" alt="Story photo by ${story.name}" class="marker-popup-image">
            <div class="marker-popup-content">
              <h3>${story.name}</h3>
              <p>${story.description}</p>
            </div>
          </div>
        `);

        this._markers[containerId].push(marker);
      }
    });

    // Fit bounds if we have multiple markers
    if (this._markers[containerId].length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      this._markers[containerId].forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  },

  fitBounds(map, bounds, options = {}) {
    map.fitBounds(bounds, options);
  },

  _addLayerControl(map) {
    const layerControl = document.createElement('div');
    layerControl.className = 'maplibregl-ctrl maplibregl-ctrl-group map-layer-control';
    layerControl.innerHTML = `
      <button class="layer-control-button" title="Change Map Style">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12,2L2,7L12,12L22,7L12,2M2,17L12,22L22,17V12L12,17L2,12V17Z"/>
        </svg>
      </button>
      <div class="layer-options" style="display: none;">
        <button class="layer-option active" data-style="streets">Streets</button>
        <button class="layer-option" data-style="satellite">Satellite</button>
        <button class="layer-option" data-style="terrain">Terrain</button>
        <button class="layer-option" data-style="dark">Dark</button>
      </div>
    `;

    // Find the navigation control group and insert layer control after it
    const navControl = map._container.querySelector('.maplibregl-ctrl-group');
    if (navControl) {
      navControl.parentNode.insertBefore(layerControl, navControl.nextSibling);
    } else {
      map._container.querySelector('.maplibregl-ctrl').appendChild(layerControl);
    }

    // Add click handlers for layer control
    const layerButton = layerControl.querySelector('.layer-control-button');
    const layerOptions = layerControl.querySelector('.layer-options');
    
    layerButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      layerOptions.style.display = layerOptions.style.display === 'none' ? 'block' : 'none';
    });

    // Close layer options when clicking outside
    document.addEventListener('click', (e) => {
      if (!layerControl.contains(e.target)) {
        layerOptions.style.display = 'none';
      }
    });

    // Add click handlers for layer options
    const options = layerControl.querySelectorAll('.layer-option');
    options.forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove active class from all options
        options.forEach(opt => opt.classList.remove('active'));
        // Add active class to clicked option
        option.classList.add('active');

        // Change map style based on selection
        const styleKey = option.dataset.style;
        let styleUrl = MAP_STYLE_URL;
        switch(styleKey) {
          case 'streets':
            styleUrl = 'https://api.maptiler.com/maps/streets/style.json?key=X5FvjDiGuHxAtiw6WFj7';
            break;
          case 'satellite':
            styleUrl = 'https://api.maptiler.com/maps/hybrid/style.json?key=X5FvjDiGuHxAtiw6WFj7';
            break;
          case 'terrain':
            styleUrl = 'https://api.maptiler.com/maps/topo/style.json?key=X5FvjDiGuHxAtiw6WFj7';
            break;
          case 'dark':
            styleUrl = 'https://api.maptiler.com/maps/basic-dark/style.json?key=X5FvjDiGuHxAtiw6WFj7';
            break;
        }
        map.setStyle(styleUrl);
        
        // Hide options after selection
        layerOptions.style.display = 'none';
      });
    });
  }
};

export default MapUtil; 