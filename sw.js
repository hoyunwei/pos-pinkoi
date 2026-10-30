// 離線快取（2026-10-30）：讓 iPad 沒網路時也能從主畫面打開收銀台。
// 做法是「有網路就抓最新版、順手存一份；沒網路才拿存下來的那份」，
// 所以推新版上去後，iPad 只要連著網路打開一次就會換成新版，不會卡在舊版。
// 存的是加密後的頁面，打開仍要輸入密碼。

const CACHE = 'pos-pinkoi';
const PAGE = './';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(PAGE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  const isPage = req.mode === 'navigate';
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(isPage ? PAGE : req, copy));
      }
      return res;
    }).catch(() =>
      caches.match(isPage ? PAGE : req).then(hit => hit || caches.match(PAGE))
    )
  );
});
