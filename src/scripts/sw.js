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

// Basic service worker installation and activation (optional for just push)
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // event.waitUntil(self.skipWaiting()); // Activate worker immediately
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  // event.waitUntil(clients.claim()); // Take control of pages immediately
}); 