import { supabase } from "@/utils/supabaseClient";

/**
 * Requests browser notification permissions and registers the background service worker
 */
export async function initializePushNotifications(userId: string) {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    console.log("Push notifications are not supported on this platform.");
    return null;
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied by user.");
      return null;
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/"
    });

    console.log("Service Worker registered successfully with scope:", registration.scope);

    // 3. Generate or retrieve push token (simulating FCM/WebPush token)
    let token = localStorage.getItem("tov_push_token");
    if (!token) {
      token = "tov_sw_token_" + Math.random().toString(36).substring(2) + "_" + Date.now();
      localStorage.setItem("tov_push_token", token);
    }

    // 4. Save token to Supabase user_push_tokens table
    const platform = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ? "Mobile"
      : "Web";

    const { error } = await supabase
      .from("user_push_tokens")
      .upsert({
        user_id: userId,
        token: token,
        platform: platform
      }, { onConflict: "token" });

    if (error) {
      console.error("Failed to save push token to database:", error);
    } else {
      console.log("Device push token registered successfully:", token);
    }

    return token;
  } catch (err) {
    console.error("Error registering push notifications:", err);
    return null;
  }
}

/**
 * Sends a local notification if the app is currently in the foreground
 */
export function showLocalNotification(title: string, body: string, dataUrl = "/") {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(title, {
      body: body,
      icon: "/manifest.webmanifest",
      vibrate: [100, 50, 100],
      data: { url: dataUrl }
    } as any);
  });
}
