self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', () => {
  // Meloloskan request jaringan langsung tanpa cache ketat agar data on-chain Solana selalu real-time
});