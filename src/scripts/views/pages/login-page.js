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
    this._form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await this._presenter.login(email, password);
        if (response) {
          window.location.hash = '#/';
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  setPresenter(presenter) {
    this._presenter = presenter;
  }
} 