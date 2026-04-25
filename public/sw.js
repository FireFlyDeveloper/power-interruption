/**
 * Service Worker for Power Interruption Monitor
 * Handles Web Push notifications while the app is in background.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[SW] Installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('[SW] Activated');
});

/**
 * Handle incoming push notifications.
 */
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const title = data.title || 'Power Interruption Monitor';
  const options = {
    body: data.body || '',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    tag: data.data?.type || 'notification',
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Handle notification click — open the app and focus on the relevant tab.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL('/', self.location.origin).href;

  const focusPromise = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  }).then((windowClients) => {
    // Focus existing tab if open
    for (const client of windowClients) {
      if (client.url === urlToOpen && 'focus' in client) {
        return client.focus();
      }
    }
    // Otherwise open new tab
    if (clients.openWindow) {
      return clients.openWindow(urlToOpen);
    }
  });

  event.waitUntil(focusPromise);
});
