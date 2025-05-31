import { getFavoriteStoriesFromDb, removeFavoriteStoryFromDb } from '../../utils/indexed-db-helper';

class FavoritesPage {
  constructor() {
    this._presenter = null; // Add a property to hold the presenter
  }

  async render() {
    return `
      <div class="container">
        <section id="favorites-container">
          <h2>Your Favorite Stories</h2>
          <!-- Back to Home Button -->
          <div class="back-to-home-container">
            <button id="backToHomeButton" class="back-button">Back to Home</button>
          </div>
          <div id="favoriteStoriesList" class="stories-grid"></div>
        </section>
      </div>
    `;
  }

  async afterRender() {
    console.log('Favorites page after render.');
    
    // Add event listener for the Back to Home button
    const backToHomeButton = document.getElementById('backToHomeButton');
    if (backToHomeButton) {
      backToHomeButton.addEventListener('click', () => {
        window.location.hash = '#/'; // Navigate to the Home page
      });
    }

    // Call the presenter's initialize method after the view is rendered
    if (this._presenter && typeof this._presenter.initialize === 'function') {
      await this._presenter.initialize();
    }

    // Setup event listener for story items using event delegation
    const storiesListElement = document.getElementById('favoriteStoriesList');
    if (storiesListElement && this._presenter && typeof this._presenter.handleStoryItemClick === 'function') {
      storiesListElement.addEventListener('click', this._presenter.handleStoryItemClick.bind(this._presenter));
    }
  }

  // Add the setPresenter method
  setPresenter(presenter) {
    this._presenter = presenter;
  }

  displayStories(stories) {
    const storiesListElement = document.getElementById('favoriteStoriesList');
    storiesListElement.innerHTML = ''; // Clear existing content

    if (stories.length === 0) {
      storiesListElement.innerHTML = '<p>You have no favorite stories yet.</p>';
      return;
    }

    stories.forEach(story => {
      // Use the same HTML structure as in HomePage for consistency
      const storyElement = document.createElement('article');
      storyElement.classList.add('story-card'); // Use story-card class
      storyElement.innerHTML = `
        <img src="${story.photoUrl}" class="story-image" alt="Story photo by ${story.name || 'Unknown User'}">
        <div class="story-content">
          <h2 class="story-title">${story.title || story.name || 'No Title'}</h2>
          <p class="story-description">${story.description ? story.description.substring(0, 100) + '...' : 'No description'}</p>
          <div class="story-meta">
            ${story.createdAt ? `
              <p class="story-date">
                <i class="fa fa-calendar" aria-hidden="true"></i> ${new Date(story.createdAt).toLocaleDateString()}
              </p>
            ` : ''}
            ${story.lat && story.lon ? `
              <p class="story-location">
                <i class="fa fa-map-marker" aria-hidden="true"></i> Location: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}
              </p>
            ` : ''}
          </div>
          <div class="story-actions">
            <a href="#/stories/${story.id}" class="read-more-button">Read More</a>
            <button class="remove-favorite-button" data-id="${story.id}">Remove from Favorites</button>
          </div>
        </div>
      `;
      storiesListElement.appendChild(storyElement);
    });
  }
}

export default FavoritesPage; 