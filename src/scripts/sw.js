self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received.');
  const data = event.data ? event.data.json() : {}; // Handle cases where data might be null or not JSON

  const title = data.title || 'Push Notification';
  const options = {
    body: data.options ? data.options.body : 'No message provided.', // Safely access body
    icon: './favicon.png', // You can set a default icon
    // Add other options as needed, e.g., image, badge, vibrate, actions
  };

  // Ensure notification options are valid before showing
  if (options.body) {
    event.waitUntil(
      self.registration.showNotification(title, options).catch((error) => {
        console.error('[Service Worker] Error showing notification:', error);
      })
    );
  } else {
    console.warn('[Service Worker] Push received but no valid body to show notification.', data);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked: ', event.notification.tag);
  event.notification.close();

  // Example: Open a window when notification is clicked
  // event.waitUntil(
  //   clients.openWindow('https://developers.google.com/web/')
  // );
});

const CACHE_NAME = 'story-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/app.css',
  '/favicon.png',
  '/manifest.json',
  // Add other critical static assets here, like images used in application shell
  // e.g., '/images/logo.png',
  // Make sure these files are included in your Webpack build output (dist folder)
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache app shell:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        console.log('[Service Worker] Serving from cache:', event.request.url);
        return response;
      }

      // No cache hit - fetch from network
      console.log('[Service Worker] Fetching from network:', event.request.url);
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response; // Don't cache non-200 or non-basic responses
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and can only be consumed once. We must clone the response
          // so that we can put the original into the cache and also serve
          // the second to the browser.
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response; // Return the original response to the browser
        })
        .catch(() => {
          // Network request failed, try to serve an offline fallback
          // For application shell, cache-first strategy already handles this.
          // For API requests or other resources, you might want to serve a specific offline page.
          console.warn('[Service Worker] Fetch failed. Network is down or resource not in cache.', event.request.url);
          // You could serve a specific offline page here if needed
          // return caches.match('/offline.html');
          // Or simply let it fail if it's a non-critical resource/API call
          throw new Error('Network request failed and no cache match.');
        });
    })
  );
}); 