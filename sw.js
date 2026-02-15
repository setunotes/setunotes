const CACHE_NAME = "ncert-images-cache-v1";

// Only cache images
const IMAGE_ASSETS = [
  "/favicon.ico"
];

// Install - Only cache image assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(IMAGE_ASSETS))
      .catch(err => console.log("Cache install error:", err))
  );
  self.skipWaiting();
});

// Activate - Clean up old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch - Selective caching based on file type
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  // Images: Cache First Strategy
  if (isImageFile(pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request)
            .then(networkResponse => {
              // Cache images for offline use
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            })
            .catch(() => {
              // Return cached image if network fails
              return caches.match(event.request);
            });
        })
    );
  }
  // HTML pages and data files: Network First Strategy (no caching)
  else if (isPageOrDataFile(pathname)) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Always fetch fresh, don't cache
          return networkResponse;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
  }
  // Other files: Network First
  else {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});

// Helper function to identify image files
function isImageFile(pathname) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'];
  return imageExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
}

// Helper function to identify page and data files
function isPageOrDataFile(pathname) {
  const pageFiles = ['.html', 'data.js'];
  return pageFiles.some(file => 
    pathname.toLowerCase().includes(file) || 
    pathname === '/' || 
    pathname.endsWith('.html')
  );
}
