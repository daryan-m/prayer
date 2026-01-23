self.addEventListener('install', e => {
  self.skipWaiting(); // وا دەکات وەشانە نوێیەکە چاوەڕێی داخرانی ئەپەکە نەکات
  e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim()); // یەکسەر کۆنتڕۆڵی لاپەڕەکە دەگرێتە دەست
});

const cacheName = 'azan-v1.0.0';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://i.imgur.com/vH97Nl8.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
