import AuthModel from '../models/auth-model';

class LoginPresenter {
  constructor(view) {
    this._view = view;
    this._authModel = new AuthModel();
  }

  async login(email, password) {
    try {
      console.log('Attempting login with:', { email });
      
      const loginResult = await this._authModel.login({ email, password });
      console.log('Login successful:', loginResult);

      // Redirect to home page after successful login
      window.location.hash = '#/';

      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      this._authModel.logout();
      window.location.hash = '#/login';
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default LoginPresenter; 