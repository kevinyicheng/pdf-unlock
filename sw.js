const CACHE = 'pdf-unlock-v1';
let sharedFile = null;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. 攔截 Share Target POST（系統分享進來的 PDF）
  if (e.request.method === 'POST' && url.pathname === '/pdf-unlock/') {
    e.respondWith((async () => {
      const formData = await e.request.formData();
      sharedFile = formData.get('file');
      // 轉到主頁，帶 ?shared=1 讓頁面知道有檔案進來
      return Response.redirect('/pdf-unlock/?shared=1', 303);
    })());
    return;
  }

  // 2. 頁面來取暫存的分享檔案
  if (e.request.method === 'GET' && url.searchParams.has('get-shared-file')) {
    e.respondWith((async () => {
      if (!sharedFile) return new Response(null, { status: 204 });
      const file = sharedFile;
      sharedFile = null;
      return new Response(file, {
        headers: {
          'Content-Type': file.type || 'application/pdf',
          'X-File-Name': encodeURIComponent(file.name || 'shared.pdf'),
        },
      });
    })());
    return;
  }
});
