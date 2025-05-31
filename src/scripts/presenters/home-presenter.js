import StoryModel from '../models/story-model';
import { setUser } from '../utils/auth';
import Auth from '../utils/auth';
import { addFavoriteStoryToDb, removeFavoriteStoryFromDb, isStoryFavoriteInDb } from '../utils/indexed-db-helper';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async getStories() {
    try {
      const stories = await this._storyModel.getStories();
      
      // Check favorite status for each story
      const storiesWithFavoriteStatus = await Promise.all(stories.map(async (story) => {
        const isFavorite = await isStoryFavoriteInDb(story.id);
        return { ...story, isFavorite };
      }));

      this._view.displayStories(storiesWithFavoriteStatus);
      this._view.initializeMapWithStories(storiesWithFavoriteStatus); // Pass updated stories to map initialization too
      return storiesWithFavoriteStatus;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      setUser(null);
      Auth.removeToken();
      window.location.hash = '#/login';
      return true;
    } catch (error) {
      throw error;
    }
  }

  async addStoryToFavorites(story) {
    console.log('Adding story to favorites:', story);
    try {
      await addFavoriteStoryToDb(story);
      console.log('Story added to favorites successfully.');
      // Optional: Update the button text immediately in the view if needed
      // This might be better handled by the view's event listener or a separate view method.
    } catch (error) {
      console.error('Failed to add story to favorites:', error);
      throw error;
    }
  }

  async removeStoryFromFavorites(storyId) {
    console.log('Removing story from favorites:', storyId);
    try {
      await removeFavoriteStoryFromDb(storyId);
      console.log('Story removed from favorites successfully.');
      // Optional: Update the button text immediately in the view if needed
    } catch (error) {
      console.error('Failed to remove story from favorites:', error);
      throw error;
    }
  }

  navigateToAddStory() {
    window.location.hash = '#/stories/add';
  }
}

export default HomePresenter; 