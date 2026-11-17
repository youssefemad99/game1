const CACHE_NAME = 'modir-el-ahwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './vendor/three.min.js',
  './js/joystick.js',
  './js/camera-controller.js',
  './js/player.js',
  './js/cafe-scene.js',
  './js/main.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon.svg'
];

// تثبيت ملفات اللعبة في الذاكرة لتشغيلها بدون إنترنت
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// تنظيف الـ Cache القديم عند وجود تحديث جديد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// الرد من الذاكرة أولاً لتكون سريعة جداً حتى على الشبكات الضعيفة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // في حالة فقدان الإنترنت تماماً
        return caches.match('./index.html');
      });
    })
  );
});
