
const CACHE_NAME = 'rowing-timer-v1';

// 安装阶段：跳过等待，立即接管
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 激活阶段：立即控制所有页面
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 策略：网络优先 (Network First)，失败则回退到缓存
    // 这样在开发时你可以看到最新改动，但服务停止时也能用
    fetch(event.request)
      .then((networkResponse) => {
        // 检查响应是否有效
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // 复制响应（因为流只能读取一次）
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
