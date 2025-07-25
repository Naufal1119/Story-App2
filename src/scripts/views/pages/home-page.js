import MapUtil from '../../utils/map-util';

export default class HomePage {
  constructor() {
    this._stories = [];
    this._map = null;
  }

  async render() {
    return `
      <a href="#mainContent" class="skip-link">Skip to content</a>
      <div class="home-container">
        <section id="mainContent">
          <div id="storiesMap" class="stories-map"></div>
          <div id="storiesContainer" class="stories-grid">
            <div class="loading-spinner">
              <div class="spinner"></div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  _renderStories() {
    if (this._stories.length === 0) {
      return '<div class="no-stories">No stories found</div>';
    }

    return this._stories.map(story => `
      <article class="story-card">
        <img src="${story.photoUrl}" class="story-image" alt="Story photo by ${story.name}">
        <div class="story-content">
          <h2 class="story-title">${story.name}</h2>
          <p class="story-description">${story.description ? story.description.substring(0, 100) + '...' : 'No description'}</p>
          <div class="story-meta">
            <p class="story-date">
              <i class="fa fa-calendar" aria-hidden="true"></i> ${new Date(story.createdAt).toLocaleDateString()}
            </p>
            ${story.lat && story.lon ? `
              <p class="story-location">
                <i class="fa fa-map-marker" aria-hidden="true"></i> Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </p>
            ` : ''}
          </div>
          <a href="#/stories/${story.id}" class="read-more-button">Read More</a>
          <button class="save-favorite-button ${story.isFavorite ? 'saved' : 'not-saved'}" data-id="${story.id}" data-title="${story.title || story.name}" data-photo="${story.photoUrl}" data-description="${story.description || ''}">${story.isFavorite ? 'Saved' : 'Save'}</button>
        </div>
      </article>
    `).join('');
  }

  async afterRender() {
    try {
      this._presenter.getStories(); // Presenter will call displayStories and initializeMapWithStories
      const addStoryLink = document.querySelector('.add-story-button');
      const logoutButton = document.getElementById('logoutButton');

      if (addStoryLink) {
        addStoryLink.addEventListener('click', (event) => {
          event.preventDefault();
          this._presenter.navigateToAddStory();
        });
      }

      if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
          const confirmLogout = confirm('Are you sure you want to logout?');
          if (confirmLogout) {
          try {
            await this._presenter.logout();
          } catch (error) {
            console.error('Error logging out:', error);
            alert('Failed to logout');
            }
          }
        });
      }

      // Add event listeners for the Save/Unsave buttons
      const storiesContainer = document.getElementById('storiesContainer');
      if (storiesContainer) {
        storiesContainer.addEventListener('click', async (event) => {
          const target = event.target;
          if (target.classList.contains('save-favorite-button')) {
            const storyId = target.dataset.id;
            const storyTitle = target.dataset.title;
            const storyPhotoUrl = target.dataset.photo;
            const storyDescription = target.dataset.description;

            const story = {
              id: storyId,
              title: storyTitle,
              photoUrl: storyPhotoUrl,
              description: storyDescription,
              // Add other properties if needed (e.g., createdAt, lat, lon)
            };

            try {
              if (target.classList.contains('not-saved')) {
                await this._presenter.addStoryToFavorites(story);
                target.textContent = 'Saved';
                target.classList.remove('not-saved');
                target.classList.add('saved');
                console.log(`Story ${storyId} added to favorites.`);
              } else {
                await this._presenter.removeStoryFromFavorites(storyId);
                target.textContent = 'Save';
                target.classList.remove('saved');
                target.classList.add('not-saved');
                console.log(`Story ${storyId} removed from favorites.`);
              }
            } catch (error) {
              console.error('Failed to update favorite status:', error);
              alert('Failed to update favorite status.');
              // Optionally revert button state on error
            }
          }
        });
      }

    } catch (error) {
      console.error('Error loading stories:', error);
      alert('Failed to load stories');
    }
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }

  // Method called by presenter to display stories
  displayStories(stories) {
    this._stories = stories; // Update internal stories data
    const storiesContainer = document.getElementById('storiesContainer');
    if (storiesContainer) {
      // Ensure DOM is ready before rendering
      requestAnimationFrame(() => {
        storiesContainer.innerHTML = this._renderStories();
      });
    }
  }

  // Method called by presenter to initialize and display map with stories
  initializeMapWithStories(stories) {
     this._stories = stories; // Ensure map has access to stories data
     // Default to Jakarta if no stories with location
    const defaultCenter = [106.8456, -6.2088];
    let center = defaultCenter;
    let zoom = 12;

    // If we have stories with location, center the map on the first one
    const storiesWithLocation = this._stories.filter(story => story.lat && story.lon);
    if (storiesWithLocation.length > 0) {
      center = [storiesWithLocation[0].lon, storiesWithLocation[0].lat];
      // If we have multiple stories, zoom out to show all
      if (storiesWithLocation.length > 1) {
        zoom = 10;
      }
    }

    // Create map using MapUtil
    this._map = MapUtil.createMap('storiesMap', center, zoom);

    // Add markers for all stories with location
    MapUtil.addMarkersWithStories(this._map, this._stories, 'storiesMap');
  }
} 