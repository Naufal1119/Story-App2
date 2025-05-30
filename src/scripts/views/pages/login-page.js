export default class LoginPage {
  constructor() {
    this._form = null;
  }

  async render() {
    return `
      <div class="login-container">
        <div class="login-card">
          <h2 class="login-title">Login</h2>
          <form id="loginForm" class="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-input" id="email" required>
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-input" id="password" required>
            </div>
            <button type="submit" class="login-button">Login</button>
            <div id="loadingIndicator" class="loading-indicator">
              <div class="spinner"></div>
            </div>
          </form>
          <p class="register-link">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </div>
      </div>
    `;
  }

  async afterRender() {
    this._form = document.getElementById('loginForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loginButton = this._form.querySelector('.login-button');

    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // Show loading indicator and disable button
      if (loadingIndicator) loadingIndicator.style.display = 'flex';
      if (loginButton) loginButton.disabled = true;
      
      try {
        const response = await this._presenter.login(email, password);
        if (response) {
          window.location.hash = '#/';
        }
      } catch (error) {
        alert(error.message);
      } finally {
        // Hide loading indicator and re-enable button
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        if (loginButton) loginButton.disabled = false;
      }
    });
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 