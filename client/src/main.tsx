import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for push notifications
if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        // Silently handle service worker errors in development
        if (import.meta.env.DEV) {
          console.warn('Service Worker registration failed (expected in dev):', error.message);
        } else {
          console.error('Service Worker registration failed:', error);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
