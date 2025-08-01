import CONFIG from '../config';
import AuthModel from './auth-model';

export default class StoryModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
    this._authModel = new AuthModel();
  }

  async getStories() {
    try {
      const user = this._authModel.getUser();
      
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching stories with token:', user.token);

      const response = await fetch(`${this._baseUrl}/stories`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stories');
      }

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.listStory;
    } catch (error) {
      console.error('Error in getStories:', error);
      throw error;
    }
  }

  async getStoryById(id) {
    try {
      const user = this._authModel.getUser();
      
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this._baseUrl}/stories/${id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch story');
      }

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.story;
    } catch (error) {
      console.error('Error in getStoryById:', error);
      throw error;
    }
  }

  async addStory(data) {
    try {
      const user = this._authModel.getUser();
      
      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('description', data.description);
      formData.append('photo', data.photo);
      
      if (data.lat && data.lon) {
        formData.append('lat', data.lat);
        formData.append('lon', data.lon);
      }

      const response = await fetch(`${this._baseUrl}/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add story');
      }

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error('Error in addStory:', error);
      throw error;
    }
  }

  async subscribeNotification(subscription) {
    try {
      const user = this._authModel.getUser();

      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to subscribe to notifications');
      }

      const data = await response.json();
      console.log('Subscription sent successfully:', data);
      return data;

    } catch (error) {
      console.error('Error in subscribeNotification:', error);
      throw error;
    }
  }

  async unsubscribeNotification(subscription) {
    try {
      const user = this._authModel.getUser();

      if (!user || !user.token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${this._baseUrl}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unsubscribe from notifications');
      }

      console.log('Unsubscription sent successfully.');
      return true;

    } catch (error) {
      console.error('Error in unsubscribeNotification:', error);
      throw error;
    }
  }
} 