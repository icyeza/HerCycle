// Listen for push notifications
self.addEventListener('push', (event) => {
    const data = event.data?.json();
    const { title, body, icon, tag } = data;
  
    event.waitUntil(
      self.registration.showNotification(title || 'New Notification', {
        body: body || 'You have a new notification',
        icon: icon || '/Hercycle_logo-removebg-preview-2.png',
        tag: tag || 'default-notification',
        vibrate: [200, 100, 200],
      })
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('http://localhost:5173/notifications')
    );
  });