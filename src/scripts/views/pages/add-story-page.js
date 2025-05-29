import { getLocation } from '../../utils/location';
import '../../../styles/pages/add-story.css';
import MapUtil from '../../utils/map-util';


export default class AddStoryPage {
  constructor() {
    this._presenter = null
  }

  async render() {
    return `
      <div class="add-story-container">
        <div class="add-story-card">
          <a href="#/" class="back-to-home-button" aria-label="Back to Home"><i class="fa fa-arrow-left"></i> Back</a>
          <h2 class="add-story-title">Add New Story</h2>
          <form id="addStoryForm" class="add-story-form">
            <div class="form-group">
              <label for="description" class="form-label">Description:</label>
              <textarea id="description" name="description" class="form-input form-textarea" required></textarea>
            </div>
            
            <div class="form-group">
              <label for="photo" class="form-label">Photo:</label>
              <div class="photo-input-container">
                <div id="cameraPreview" class="camera-preview" style="display: none;">
                  <video id="cameraVideo" class="camera-video"></video>
            </div>
                <div class="camera-buttons" style="display: none;">
                  <button type="button" id="captureButton" class="capture-button">Take Photo</button>
                  <button type="button" id="retakeButton" class="retake-button">Retake</button>
                  <button type="button" id="closeCameraButton" class="close-button">Close</button>
            </div>
                <div id="photoPreview" class="photo-preview"></div>
                <div class="photo-controls">
                  <button type="button" id="cameraButton" class="camera-button">
                    <i class="fa fa-camera"></i> Open Camera
                  </button>
                  <input type="file" id="photo" name="photo" accept="image/*" class="file-input" required>
              </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Location:</label>
              <div id="map" class="map"></div>
              <button type="button" id="getLocationButton" class="location-button">
                <i class="fa fa-map-marker"></i> Get Current Location
              </button>
              <input type="hidden" id="latitude" name="latitude">
              <input type="hidden" id="longitude" name="longitude">
            </div>

            <button type="submit" class="submit-button">Add Story</button>
          </form>
        </div>
      </div>
    `;
  }

  async afterRender() {
    // Get DOM elements
    const form = document.getElementById('addStoryForm');
    const cameraButton = document.getElementById('cameraButton');
    const getLocationButton = document.getElementById('getLocationButton');
    const photoInput = document.getElementById('photo');
    const photoPreview = document.getElementById('photoPreview');
    const latitudeInput = document.getElementById('latitude');
    const longitudeInput = document.getElementById('longitude');

    // Pass elements/IDs to presenter for handling map and camera
    if (this._presenter && typeof this._presenter.initializeMap === 'function') {
       this._presenter.initializeMap('map'); // Pass map container ID
    }
     if (this._presenter && typeof this._presenter.initializeCamera === 'function') {
        this._presenter.initializeCamera(
            'cameraVideo',
            'cameraPreview',
            '.camera-buttons',
            'captureButton',
            'retakeButton',
            'closeCameraButton',
            'photoPreview',
            'photo'); // Pass camera related element IDs/selectors
     }

    // Handle form submission
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const description = document.getElementById('description').value;
        const photo = photoInput.files[0];
        const lat = parseFloat(latitudeInput.value);
        const lon = parseFloat(longitudeInput.value);

        const data = {
          description,
          photo,
          lat,
          lon
        };

        if (this._presenter && typeof this._presenter.submitStory === 'function') {
            this._presenter.submitStory(data); // Call presenter method
        }
      });
    }

    // Handle file input change (alternative to camera)
     if (photoInput) {
        photoInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
             if (file) {
                if (this._presenter && typeof this._presenter.handleFileSelect === 'function') {
                     this._presenter.handleFileSelect(file, 'photoPreview'); // Call presenter method
                }
            }
        });
     }

    // Handle camera button click
    if (cameraButton) {
        cameraButton.addEventListener('click', () => {
            if (this._presenter && typeof this._presenter.startCamera === 'function') {
                this._presenter.startCamera();
            }
        });
    }
    
    // Handle Get Location button click
    if (getLocationButton) {
        getLocationButton.addEventListener('click', async () => {
             if (this._presenter && typeof this._presenter.handleGetLocation === 'function') {
                 this._presenter.handleGetLocation('latitude', 'longitude');
            }
        });
    }

  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

   // Methods called by presenter to update UI
   displayPhotoPreview(imgSrc) {
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            img.style.objectFit = 'contain';
            img.alt = 'Photo preview';
            photoPreview.innerHTML = '';
            photoPreview.appendChild(img);
        }
   }
   
   clearPhotoPreview() {
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview) {
            photoPreview.innerHTML = '';
        }
        const photoInput = document.getElementById('photo');
        if (photoInput) {
           photoInput.value = null; // Clear file input
        }
   }
   
   updateLocationInput(lat, lon) {
       const latInput = document.getElementById('latitude');
       const lonInput = document.getElementById('longitude');
       if (latInput) {
           latInput.value = lat;
       }
       if (lonInput) {
           lonInput.value = lon;
       }
   }

    // Method called by presenter to display location popup
    displayLocationPopup(marker, lat, lon, map) {
        // Format coordinates to 4 decimal places (or as needed for display)
        const formattedLat = parseFloat(lat).toFixed(4);
        const formattedLon = parseFloat(lon).toFixed(4);
        
        // Create and set popup content
        const popupContent = `<b>Lat:</b> ${formattedLat}<br><b>Lon:</b> ${formattedLon}`; // Using simpler format for add story page

        // Add popup to marker and open it immediately
        const popup = MapUtil.addPopup(marker, popupContent);
        popup.addTo(map);
    }
} 