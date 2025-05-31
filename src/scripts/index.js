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
import { subscribeUser, unsubscribeUser } from './utils/notification-helper';

// Definition of the App class (moved from views/pages/app.js)
class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._navigationDrawer = navigationDrawer;
    this._authModel = new AuthModel();

    // Get references to navigation list items
    this._addStoryNavItem = this._navigationDrawer.querySelector('.add-story-button').parentElement;
    this._subscribeNavItem = this._navigationDrawer.querySelector('.subscribe-button').parentElement;
    this._logoutNavItem = this._navigationDrawer.querySelector('.logout-button').parentElement;
    this._subscribeButton = this._navigationDrawer.querySelector('.subscribe-button');
    this._favoritesNavItem = this._navigationDrawer.querySelector('.favorites-button').parentElement;

    this._initialAppShell();
    this._checkSubscriptionStatusAndUpdateButton();
    this._updateNavigationVisibility(); // Initial visibility check
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

    // Add event listener for the Favorites button
    const favoritesButton = this._navigationDrawer.querySelector('#favoritesButton');
    if (favoritesButton) {
      favoritesButton.addEventListener('click', () => {
        window.location.hash = '#/favorites';
        // Close the drawer after navigation
        if (this._navigationDrawer) {
          this._navigationDrawer.classList.remove('open');
        }
      });
    }

    if (this._subscribeButton) {
      this._subscribeButton.addEventListener('click', async () => {
        const isLoggedIn = this._authModel.isLoggedIn();
        if (!isLoggedIn) {
          alert('Please login to subscribe.');
          return;
        }

        try {
          if (this._subscribeButton.textContent === 'Subscribe') {
            await subscribeUser();
            alert('Subscribed to push notifications!');
          } else {
            await unsubscribeUser();
            alert('Unsubscribed from push notifications.');
          }
          await this._checkSubscriptionStatusAndUpdateButton();
        } catch (error) {
          console.error('Subscription/Unsubscription failed:', error);
          alert(`Action failed: ${error.message}`);
        }
      });
    }
  }

  async renderPage() {
    const url = parseActiveUrlWithCombiner();
    const page = routes[url] || routes['/404'];
    
    // Update navigation visibility before rendering the page
    this._updateNavigationVisibility(url);
    
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

    // Update navigation visibility after rendering the page (just in case afterRender changes something relevant)
    this._updateNavigationVisibility(url);
  }

  _updateNavigationVisibility(url = parseActiveUrlWithCombiner()) {
    const isLoggedIn = this._authModel.isLoggedIn();
    const isAuthPage = url === '/login' || url === '/register';

    if (this._addStoryNavItem) {
      this._addStoryNavItem.style.display = (isLoggedIn && !isAuthPage) ? 'list-item' : 'none';
    }
    if (this._subscribeNavItem) {
      this._subscribeNavItem.style.display = (isLoggedIn && !isAuthPage) ? 'list-item' : 'none';
      if (isLoggedIn && !isAuthPage) {
        this._checkSubscriptionStatusAndUpdateButton();
      }
    }
    if (this._logoutNavItem) {
      this._logoutNavItem.style.display = isLoggedIn ? 'list-item' : 'none';
    }
    
    // Control visibility of the Favorites button
    if (this._favoritesNavItem) {
        this._favoritesNavItem.style.display = (isLoggedIn && !isAuthPage) ? 'list-item' : 'none';
    }

     // The Home link should always be visible, regardless of login status
     // We don't need to explicitly control its visibility here unless there's a specific requirement
  }

  async _checkSubscriptionStatusAndUpdateButton() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !this._subscribeButton) {
      return; // Exit if not supported or button not found
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // User is subscribed
        this._subscribeButton.textContent = 'Unsubscribe';
        this._subscribeButton.classList.add('unsubscribe-button'); // Add class for styling
        this._subscribeButton.classList.remove('subscribe-button'); // Remove class
      } else {
        // User is not subscribed
        this._subscribeButton.textContent = 'Subscribe';
        this._subscribeButton.classList.add('subscribe-button'); // Add class for styling
        this._subscribeButton.classList.remove('unsubscribe-button'); // Remove class
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      // Optionally disable button or show error state
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

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    });
  }
});
