const CACHE_NAME="radarrio-v2";
const CORE=["./","./index.html","./manifest.webmanifest","./css/styles.css","./js/main.js","./js/map.js","./js/gps.js","./js/alerts.js","./data/radars.json","./data/pardal-rj.geojson","./data/pardal-audit.json","./data/audit.json","./data/sources.json","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=="GET")return;
  if(url.origin===location.origin){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
      if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));}
      return response;
    }).catch(()=>caches.match("./index.html"))));
  }
});
