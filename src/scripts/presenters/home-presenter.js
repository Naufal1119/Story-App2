import StoryModel from '../models/story-model';
import { setUser } from '../utils/auth';
import Auth from '../utils/auth';

class HomePresenter {
  constructor(view) {
    this._view = view;
    this._storyModel = new StoryModel();
  }

  async getStories() {
    try {
      const stories = await this._storyModel.getStories();
      this._view.displayStories(stories);
      this._view.initializeMapWithStories(stories);
      return stories;
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

  navigateToAddStory() {
    window.location.hash = '#/stories/add';
  }
}

export default HomePresenter; 