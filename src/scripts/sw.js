// Remove or comment out old manual caching logic
// const CACHE_NAME = 'story-app-cache-v1';
// const urlsToCache = [ ... ];
// self.addEventListener('install', (event) => { ... });
// self.addEventListener('activate', (event) => { ... });
// self.addEventListener('fetch', (event) => { ... });

// Import Workbox modules
import { cleanupOutdatedCaches, precacheAndRoute, matchPrecache } from 'workbox-precaching';
import { registerRoute, setCatchHandler } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Clean up old caches
cleanupOutdatedCaches();

// Precache all assets listed in the manifest (injected by WorkboxWebpackPlugin)
precacheAndRoute(self.__WB_MANIFEST || []);

// --- Runtime Caching Strategies ---

// Cache First strategy for Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache First strategy for Google Fonts webfonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }), // 1 Year
    ],
  })
);

// Cache First strategy for external CDN assets (unpkg, cdnjs)
registerRoute(
  ({url}) => url.origin === 'https://unpkg.com' || url.origin === 'https://cdnjs.cloudflare.com',
  new CacheFirst({
    cacheName: 'external-cdn-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 Days
    ],
  })
);

// Stale While Revalidate strategy for images (including map tiles)
registerRoute(
  ({ request, url }) => request.destination === 'image' ||
                       url.hostname.includes('tile.openstreetmap.org') ||
                       url.hostname.includes('api.maptiler.com'), // Include map tile providers
  new StaleWhileRevalidate({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 Days
    ],
  })
);

// Network First strategy for Story API GET requests
registerRoute(
    ({ url, request }) => url.hostname === 'story-api.dicoding.dev' && request.method === 'GET',
    new NetworkFirst({
        cacheName: 'story-api-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }), // 24 Hours
        ],
         networkTimeoutSeconds: 10, // Fallback to cache after 10 seconds
    })
);

// --- Offline Fallback --- (using setCatchHandler for navigations)
setCatchHandler(async ({ event }) => {
  // The catch handler is triggered when a route handler throws an error
  // or returns a Response.error().
  
  // Check if the failed request is for the story API endpoint.
  if (event.request.url === 'https://story-api.dicoding.dev/v1/stories') {
    console.warn(`[Service Worker] Failed to fetch story API (${event.request.url}). Serving empty response as fallback.`);
    // Return a synthetic response with an empty array
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check if the request is a navigation.
  if (event.request.mode === 'navigate') {
    console.warn(`[Service Worker] Navigasi gagal untuk ${event.request.url}. Mencoba sajikan halaman offline.`);
    const offlinePage = await matchPrecache('/offline.html'); // Try to match offline.html in precache
    return offlinePage || Response.error(); // Serve offline page or return network error
  }

  // Fallback for other types of requests (optional, might just let them fail)
  console.warn(`[Service Worker] Catch handler triggered for other request: ${event.request.url}.`);
  // For other failed requests, we might still want to return an error or a generic offline asset
  // Depending on the asset type, you might serve a placeholder image, etc.
  // For now, we'll just return an error.
  return Response.error();
});

// --- Existing Push Notification Handlers ---

// Your existing push handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received.');
  const data = event.data ? event.data.json() : {}; // Handle cases where data might be null or not JSON

  const title = data.title || 'Push Notification';
  const options = {
    body: data.options ? data.options.body : (data.body || 'No message provided.'), // Safely access body
    icon: data.options ? data.options.icon : (data.icon || './favicon.png'), // Safely access icon, fallback to default
    badge: data.options ? data.options.badge : (data.badge || null), // Safely access badge
    data: data.options ? data.options.data : (data.data || null), // Safely access data payload
    // Add other options as needed, e.g., image, vibrate, actions
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

// Your existing notificationclick handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');
  event.notification.close();

  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : '/index.html#/'; // Default to home if no URL in data

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // Check if client URL matches base URL (pathname) to focus it
        if (new URL(client.url).pathname === new URL(urlToOpen, self.location.origin).pathname) {
             // Optional: Navigate to the specific hash if already on the base page
            if (client.url !== new URL(urlToOpen, self.location.origin).href && 'navigate' in client) {
                client.navigate(urlToOpen);
            }
          if ('focus' in client) {
            return client.focus();
          }
        }
      }
      // If no existing client is found or focused, open a new window
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    }).catch(err => console.error('Error handling notification click:', err))
  );
});

// Optional: Add explicit install and activate listeners for immediate control
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(self.clients.claim()); }); 