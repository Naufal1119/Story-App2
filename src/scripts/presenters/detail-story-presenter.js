import StoryModel from '../models/story-model';
import MapUtil from '../utils/map-util';

class DetailStoryPresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
    this._map = null;
  }

  async initializeDetail(storyId, mapContainerId) {
    try {
      // Get story data
      const story = await this._storyModel.getStoryById(storyId);
      
      if (!story) {
        this._view.showNotFound();
        return;
      }

      // Display story
      this._view.displayStory(story);

      // Initialize map if story has location
      if (story.lat && story.lon) {
        this._initializeMap(mapContainerId, story);
      }

      // Hide loading spinner
      this._view.hideLoadingSpinner();
    } catch (error) {
      console.error('Error initializing detail:', error);
      this._view.showNotFound();
    }
  }

  _initializeMap(containerId, story) {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) return;

    this._map = MapUtil.createMap(containerId, [story.lon, story.lat], 10);
    
    // Format coordinates to 6 decimal places for better readability
    const lat = parseFloat(story.lat).toFixed(6);
    const lon = parseFloat(story.lon).toFixed(6);
    
    // Create marker with popup
    const marker = MapUtil.addMarker(this._map, [story.lon, story.lat]);
    
    // Add popup to marker and open it immediately
    if (this._view && typeof this._view.displayLocationPopup === 'function') {
        this._view.displayLocationPopup(marker, story.lat, story.lon, this._map);
    }
  }
}

export default DetailStoryPresenter; 