import { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { Bell } from "lucide-react";

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(localStorage.getItem("isSubscribed") === "true");
  

//   useEffect(() => {
//     const checkSubscription = async () => {
//       try {
//         const response = await axiosInstance.post("/notifications/test");
//         // localStorage.setItem("isSubscribed", true);
//       } catch (error) {
//         console.error("Error checking subscription:", error);
//       }
//     };
//     checkSubscription();
//   }, []);

  // Request permission & subscribe
  const handleSubscribe = async () => {
    try {
      // Check if browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission denied.");
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      });

      // Send subscription to backend
      await axiosInstance.post("/notifications/subscribe", {
        subscription,
      });
      setIsSubscribed(true);
      alert("Successfully subscribed to notifications!");
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("Failed to subscribe to notifications.");
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={isSubscribed}
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      <div className="flex items-center">
        <Bell className="w-4 h-4 mr-2" />
        {isSubscribed ? "Disable Notifications" : "Enable Notifications"}
      </div>
    </button>
  );
}
