const cacheName = 'azan-v1.0.1'; // هەر کاتێک کۆدەکەت گۆڕی، ئەم ژمارەیە لێرە بگۆڕە (بۆ نموونە بیکە بە v1.0.2)
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.imgur.com/vH97Nl8.png'
];

// ١. قۆناغی دامەزراندن: هەموو فایلە پێویستەکان خەزن دەکات لە ناو مۆبایلەکە
self.addEventListener('install', e => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching assets for offline use...');
      return cache.addAll(assets);
    })
  );
});

// ٢. قۆناغی چالاککردن: وەشانە کۆنەکان دەسڕێتەوە بۆ ئەوەی جێگا نەگرن
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ٣. قۆناغی هێنان: ئەگەر ئینتەرنێت نەبوو، فایلە خەزنکراوەکان پیشان دەدات
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
