self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('test-sw').then(cache => {
      return cache.addAll([
        'http://localhost:8888/test-sw/static/main.js',
        'http://localhost:8888/test-sw/static/a.png',
        'http://localhost:8888/test-sw/static/b.png',
      ]);
    }),
  );
  console.log('install');
});

self.addEventListener('activate', event => {
  console.log('activate');
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  console.log('fetch', event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }),
  );
});
