import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);

// Immediate Global Capture of beforeinstallprompt so it is never missed
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPwaPrompt = e;
  console.log('[PWA] Early beforeinstallprompt event captured and stored on window.deferredPwaPrompt');
  window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] KalaSetu was successfully installed to device!');
  window.deferredPwaPrompt = null;
  window.dispatchEvent(new CustomEvent('pwa-installed'));
});

// Register Service Worker for PWA (works in prod and staging)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[PWA] ServiceWorker successfully registered with scope:', reg.scope);
        // Periodically check for updates every 30 minutes
        setInterval(() => {
          reg.update().catch(() => {});
        }, 30 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('[PWA] ServiceWorker registration encountered issue:', err);
      });
  });

  // Automatically check for update whenever user switches back to the app / unlocks phone
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.update().catch(() => {});
      });
    }
  });
}


