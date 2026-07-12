// firebase-messaging-sw.js
// Handles push notifications when the browser window is closed or in the background

self.addEventListener("push", function (event) {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || payload.title || "The Oldverse Update";
    const notificationOptions = {
      body: payload.notification?.body || payload.body || "You have a new message.",
      icon: payload.notification?.icon || payload.icon || "/manifest.webmanifest",
      badge: "/manifest.webmanifest",
      data: payload.data || payload,
      vibrate: [200, 100, 200],
      actions: [
        { action: "open", title: "Open App" },
        { action: "close", title: "Close" }
      ],
      tag: payload.tag || "tov-notification"
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (err) {
    console.error("Error displaying push notification:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const action = event.action;
  const clickData = event.notification.data || {};
  const targetUrl = clickData.url || "/";

  if (action === "close") return;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
