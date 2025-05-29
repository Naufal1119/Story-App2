import CONFIG from "../config";
import AuthModel from "../models/auth-model";

export default class RegisterPresenter {
  constructor(view) {
    this._view = view;
    this._authModel = new AuthModel();
  }

  async register(userData) {
    const { name, email, password } = userData;

    // Basic validation based on documentation
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required.');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      // Use AuthModel to handle registration fetch
      const responseData = await this._authModel.register(userData);

      // Handle successful registration
      alert('User Registered Successfully! Please login.');
      window.location.hash = '#/login';

      return responseData; // Or true, depending on what you need
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message);
      throw error;
    }
  }
} 