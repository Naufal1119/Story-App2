import { getFavoriteStoriesFromDb, removeFavoriteStoryFromDb } from '../utils/indexed-db-helper';

class FavoritesPresenter {
  constructor({ view }) {
    this._view = view;
  }

  async initialize() {
    console.log('Initializing FavoritesPresenter...');
    await this._displayFavoriteStories();
    this._setupEventListeners();
  }

  async _displayFavoriteStories() {
    try {
      const favoriteStories = await getFavoriteStoriesFromDb();
      this._view.displayStories(favoriteStories);
    } catch (error) {
      console.error('Error fetching favorite stories:', error);
      this._view.displayStories([]); // Display empty or error state
    }
  }

  _setupEventListeners() {
    // Use event delegation on the story list container
    const storiesListElement = document.getElementById('favoriteStoriesList');
    if (storiesListElement) {
      storiesListElement.addEventListener('click', this._handleStoryItemClick.bind(this));
    }
  }

  async _handleStoryItemClick(event) {
    const target = event.target;

    // Handle remove favorite button click
    if (target.classList.contains('remove-favorite-button')) {
      const storyId = target.dataset.id;
      if (storyId) {
        if (confirm('Are you sure you want to remove this story from favorites?')) {
          try {
            await removeFavoriteStoryFromDb(storyId);
            console.log(`Story ${storyId} removed from favorites.`);
            // Re-render the list after removal
            await this._displayFavoriteStories();
          } catch (error) {
            console.error(`Error removing story ${storyId} from favorites:`, error);
            alert('Failed to remove story from favorites.');
          }
        }
      }
    }

    // Add other story item click handlers here if needed (e.g., navigating to detail)
    // For example, if clicking the story element itself navigates to detail:
    // if (target.closest('.story-item') && !target.classList.contains('remove-favorite-button')) {
    //   const storyElement = target.closest('.story-item');
    //   const storyId = storyElement.querySelector('.remove-favorite-button').dataset.id;
    //   if (storyId) {
    //     window.location.hash = `#/stories/detail/${storyId}`; // Assuming detail route format
    //   }
    // }
  }

  // Add methods for handling like/unlike if those buttons were in the view
  // For now, the view only has a 'Remove from Favorites' button.
}

export default FavoritesPresenter; 