
# Landing Performance Calculator — PWA Package

This folder is a ready-to-deploy PWA for your `V2_19.html`.

## Files
- `index.html` — your original app with PWA hooks (manifest + SW registration + update banner).
- `manifest.webmanifest` — PWA metadata (name, icons, colors).
- `sw.js` — Service Worker with versioned cache and an **update prompt**.
- `icons/` — placeholder icons (192, 512 px). Replace with your own when ready.

## Deploy
Upload the entire folder to any static HTTPS host (GitHub Pages, Netlify, Vercel, S3, nginx). The app should be served from the same path (root recommended).

## How updates work (your "push to new version")
1. Edit `sw.js` and bump `VERSION` (e.g., `v1.0.1` → `v1.0.2`) on each release.
2. Deploy. When users open the app, the new SW installs and the page shows a **New version available** banner.
3. Clicking **Reload** swaps in the new SW immediately via `skipWaiting` and reloads the page.

The app also checks for updates on tab focus and once per hour.

## True Web Push (optional)
If you need **push notifications even when the app is closed**, you'll need:
- A small server that generates VAPID keys and stores subscriptions from clients.
- An endpoint (e.g., `/subscribe`) to save each `PushSubscription`.
- To uncomment the push handlers in `sw.js` and implement `self.registration.showNotification(...)`.
- Server code to send pushes to saved subscriptions.

Until then, the built-in update banner provides a practical "push new version" experience without server work.
