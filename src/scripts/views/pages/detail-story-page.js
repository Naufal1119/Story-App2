import MapUtil from '../../utils/map-util'; // Import MapUtil here

export default class DetailStoryPage {
  constructor() {
    this._story = null;
    this._presenter = null; // Add presenter property
    // Remove map related properties
    // this._map = null;
    // this._marker = null;
  }

  async render() {
    return `
      <a href="#mainContent" class="skip-link">Skip to content</a>
      <div class="detail-container">
        <article class="detail-card">
          <div id="storyContent" role="main" id="mainContent">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  _renderStory() {
    if (!this._story) {
      return '<div class="not-found">Story not found</div>';
    }

    return `
      <img src="${this._story.photoUrl}" class="detail-image" alt="Story photo by ${this._story.name}">
      <div class="detail-content">
        <h1 class="detail-title">${this._story.name}</h1>
        <p class="detail-description">${this._story.description}</p>
        ${this._story.lat && this._story.lon ? `
          <section class="detail-location" aria-labelledby="locationTitle">
            <h2 id="locationTitle" class="location-title">Location</h2>
            <div id="detailMap" class="detail-map" role="application" aria-label="Story location map"></div>
            <p class="location-coords">Latitude: ${this._story.lat}</p>
            <p class="location-coords">Longitude: ${this._story.lon}</p>
          </section>
        ` : ''}
        <p class="detail-date">Posted on ${new Date(this._story.createdAt).toLocaleDateString()}</p>
      </div>
    `;
  }

  // Remove _initializeMap function from here
  // _initializeMap() { ... }

  async afterRender() {
    // Get story ID from URL and fetch data (handled by presenter)
    // Initialize map (handled by presenter)
    if (this._presenter && typeof this._presenter.initializeDetail === 'function') {
        const url = window.location.hash.split('/');
        const storyId = url[url.length - 1];
        this._presenter.initializeDetail(storyId, 'detailMap'); // Pass storyId and map container ID
    }

    // Remove story fetching and map initialization logic from here
    // try { ... } catch (error) { ... }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

   // Method called by presenter to display story details
   displayStory(story) {
       this._story = story;
       const storyContent = document.getElementById('storyContent');
       if (storyContent) {
           storyContent.innerHTML = this._renderStory();
       }
   }

   // Method called by presenter to hide loading spinner
   hideLoadingSpinner() {
       const spinner = document.querySelector('.loading-spinner');
       if (spinner) {
           spinner.style.display = 'none';
       }
   }

    // Method called by presenter to show not found message
    showNotFound() {
        const storyContent = document.getElementById('storyContent');
        if (storyContent) {
            storyContent.innerHTML = '<div class="not-found">Story not found</div>';
        }
    }

    // Method called by presenter to display location popup
    displayLocationPopup(marker, lat, lon, map) {
        // Format coordinates to 6 decimal places
        const formattedLat = parseFloat(lat).toFixed(6);
        const formattedLon = parseFloat(lon).toFixed(6);
        
        // Create and set popup content
        const popupContent = `
            <div class="coordinates">
              <p><strong>Latitude:</strong> ${formattedLat}°</p>
              <p><strong>Longitude:</strong> ${formattedLon}°</p>
            </div>
        `;

        // Add popup to marker and open it immediately
        const popup = MapUtil.addPopup(marker, popupContent);
        popup.addTo(map);
    }
} 