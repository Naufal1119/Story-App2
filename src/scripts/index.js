// CSS imports
import '../styles/styles.css';
import '../styles/pages/home.css';
import '../styles/pages/login.css';
import '../styles/pages/register.css';
import '../styles/pages/add-story.css';
import '../styles/pages/detail-story.css';

import routes from './routes/routes';
import { parseActiveUrlWithCombiner } from './routes/url-parser';
import AuthModel from './models/auth-model';

// Definition of the App class (moved from views/pages/app.js)
class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._authModel = new AuthModel();

    this._initialAppShell();
  }

  _initialAppShell() {
    if (this._drawerButton) {
      this._drawerButton.addEventListener('click', (event) => {
        this._navigationDrawer.classList.toggle('open');
        event.stopPropagation();
      });
    }

    if (this._navigationDrawer) {
      this._navigationDrawer.addEventListener('click', (event) => {
        event.stopPropagation();
      });

      document.addEventListener('click', () => {
        this._navigationDrawer.classList.remove('open');
      });
    }
  }

  async renderPage() {
    const url = parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/404'];
    
    // Cek autentikasi untuk halaman yang membutuhkan login
    if (url !== '/login' && url !== '/register' && !this._authModel.isLoggedIn()) {
      window.location.hash = '#/login';
      return;
    }
    
    // Ensure authenticated users trying to access login/register are redirected to home
     if ((url === '/login' || url === '/register') && this._authModel.isLoggedIn()) {
         window.location.hash = '#/';
         return;
     }

    // Use View Transition API if supported
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        try {
          this._content.innerHTML = await page.render();
          if (typeof page.afterRender === 'function') {
              await page.afterRender();
          }
        } catch (error) {
          console.error('Error rendering page with transition:', error);
          this._content.innerHTML = '<h2>Error loading page</h2>';
        }
      });
    } else {
      // Fallback for browsers that don't support View Transition API
      try {
        this._content.innerHTML = await page.render();
        if (typeof page.afterRender === 'function') {
            await page.afterRender();
        }
      } catch (error) {
        console.error('Error rendering page without transition:', error);
        this._content.innerHTML = '<h2>Error loading page</h2>';
      }
    }
  }
}

// Existing DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});
