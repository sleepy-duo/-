
const CACHE_NAME = 'rowing-timer-v2';

// 需要预缓存的关键资源
const URLS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  // 缓存图标以保证离线时 App 图标正常显示 (如果支持)
  'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f6a3.png'
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((err) => console.log('Cache addAll failed:', err))
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 策略：网络优先 (Network First)，失败则回退到缓存
    fetch(event.request)
      .then((networkResponse) => {
        // 检查响应是否有效
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && networkResponse.type !== 'cors') {
          return networkResponse;
        }

        // 复制响应
        const responseToCache = networkResponse.clone();

        // 存入缓存
        caches.open(CACHE_NAME).then((cache) => {
          try {
            cache.put(event.request, responseToCache);
          } catch (err) {
            // 忽略非 HTTP/HTTPS 协议的缓存错误
          }
        });

        return networkResponse;
      })
      .catch(() => {
        // 网络请求失败（离线），尝试从缓存读取
        return caches.match(event.request);
      })
  );
});