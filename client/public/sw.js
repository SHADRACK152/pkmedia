// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  if (!event.data) {
    console.log('No push data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Mount Kenya News',
      body: event.data.text(),
      icon: '/logo.png',
      badge: '/logo.png'
    };
  }

  const options = {
    body: data.body || data.excerpt || 'New article published',
    icon: data.icon || data.image || '/logo.png',
    badge: data.badge || '/logo.png',
    image: data.image,
    data: {
      url: data.url || '/',
      articleId: data.articleId
    },
    vibrate: [200, 100, 200],
    tag: data.tag || 'article-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Read Article'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Article', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open with this URL
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
