import CONFIG from '../config';
import Auth from '../utils/auth';

export default class AuthModel {
  constructor() {
    this._baseUrl = CONFIG.BASE_URL;
  }

  async register(data) {
    try {
      const response = await fetch(`${this._baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      if (!response.ok) {
         throw new Error(responseJson.message || 'Registration failed');
      }
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      return responseJson;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async login(data) {
    try {
      const response = await fetch(`${this._baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseJson = await response.json();
      if (!response.ok) {
        throw new Error(responseJson.message || 'Login failed');
      }
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      if (responseJson.loginResult && responseJson.loginResult.token) {
          Auth.setToken(responseJson.loginResult.token);
      } else {
           throw new Error('Login successful but token not received.');
      }
     
      return responseJson.loginResult;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  logout() {
    Auth.removeToken();
  }

  getToken() {
    return Auth.getToken();
  }

  isLoggedIn() {
    return !!Auth.getToken();
  }

  getUser() {
     return { token: Auth.getToken() };
  }
} 