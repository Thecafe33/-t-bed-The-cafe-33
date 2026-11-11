// Cache public resources within this app's own directory; never account/API responses or OSM tiles.
const APP_ROOT = new URL('./', self.location.href);
const INDEX_URL = new URL('index.html', APP_ROOT).href;
const ASSETS_PATH = new URL('assets/', APP_ROOT).pathname;
const CACHE_PREFIX = `oceo-townwalk:${encodeURIComponent(APP_ROOT.pathname)}:`;
const CACHE = CACHE_PREFIX + '2026-11-11-v54';
const CORE = [
  "index.html",
  "assets/boot.js",
  "assets/header.js",
  "assets/scroll-navigation.js",
  "assets/discovery.js",
  "assets/excavation-sites.js",
  "assets/excavation-field.js",
  "assets/excavation-art.js",
  "assets/excavation-renderer.js",
  "assets/dig-sound.js",
  "assets/stream-sieve.js",
  "assets/discovery-messages.js",
  "assets/discovery.css?v=20261111-dig9",
  "assets/narration.js",
  "assets/narration-scripts.js",
  "assets/narration-sources.js",
  "assets/narration.css?v=20261109",
  "assets/header.css?v=20261108-stable",
  "assets/style.css",
  "assets/app-shell.css",
  "assets/discover.css?v=20261106-mountain",
  "assets/town-map.css?v=20261111-map4",
  "assets/genz.css",
  "assets/artifacts.js",
  "assets/artifact-view.js",
  "assets/artifact-deck-state.js",
  "assets/artifact-deck.js",
  "assets/artifacts.css?v=20261108-page",
  "assets/town-map.js",
  "assets/data/oceo-town-map.geojson",
  "assets/vendor/leaflet.markercluster.js",
  "assets/vendor/markercluster.css",
  "assets/app.js",
  "assets/i18n.js",
  "assets/effects.js",
  "assets/quick-navigation.js",
  "assets/quick-navigation.css?v=20261108-direct",
  "assets/interaction-motion.js",
  "assets/interaction-motion.css?v=20261108",
  "assets/locales-ui.js",
  "assets/locales-content.js",
  "assets/locales-policy.js",
  "assets/locales-extra.js",
  "assets/fonts/townwalk-sc-regular.woff2",
  "assets/fonts/townwalk-sc-bold.woff2",
  "assets/pass-art.js",
  "assets/pass-collage.css?v=20261107-soft",
  "assets/pass-poster.js",
  "assets/campaign-home.js",
  "assets/campaign.css?v=20261106-mountain",
  "assets/place-feed.js",
  "assets/place-feed.css?v=20261106-mountain",
  "assets/campaign-messages.js",
  "assets/journey.js",
  "assets/journey-story.css?v=20261106-fresh",
  "assets/story-creator.js",
  "assets/story-art.js",
  "assets/previews/oc-eo-personal-story-vi.webp",
  "assets/previews/oc-eo-personal-story-en.webp",
  "assets/previews/oc-eo-personal-story-zh.webp",
  "assets/heritage-symbols.js",
  "assets/heritage-art/nandin-giong-cat.webp",
  "assets/heritage-art/linh-son-bac-relief.webp",
  "assets/heritage-art/linga-yoni-linh-son.webp",
  "assets/heritage-art/jar-go-cay-tram.webp",
  "assets/stamp-shape.js",
  "assets/model.js",
  "assets/app-paths.js",
  "assets/content.js",
  "assets/icons.js",
  "assets/cloud.js",
  "assets/policy.js",
  "assets/vendor/leaflet.js",
  "assets/vendor/leaflet.css",
  "assets/vendor/firebase.js",
  "assets/photos/ba-the.jpg",
  "assets/favicon.svg",
  "assets/fonts/be-vietnam-pro-latin-500-normal.woff2",
  "assets/fonts/be-vietnam-pro-latin-ext-500-normal.woff2",
  "assets/fonts/be-vietnam-pro-vietnamese-500-normal.woff2",
  "assets/fonts/be-vietnam-pro-latin-800-normal.woff2",
  "assets/fonts/be-vietnam-pro-latin-ext-800-normal.woff2",
  "assets/fonts/be-vietnam-pro-vietnamese-800-normal.woff2",
  "assets/fonts/lora-latin-500-italic.woff2",
  "assets/fonts/lora-latin-ext-500-italic.woff2",
  "assets/fonts/lora-vietnamese-500-italic.woff2",
].map(path => new URL(path, APP_ROOT).href);
// Bypass the browser's HTTP cache when installing: GitHub Pages lets files live there for
// minutes, and an install mixing a fresh stylesheet with a stale module breaks the layout.
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE.map((url) => new Request(url, { cache: "reload" })))).then(() => self.skipWaiting())),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && (k.startsWith(CACHE_PREFIX) ||
              (APP_ROOT.pathname === '/' && k.startsWith('oceo-townwalk-'))))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request,
    u = new URL(request.url);
  if (request.method !== "GET" || u.origin !== self.location.origin) return;
  // Native audio controls send byte ranges, including after seeking. Cache one
  // complete first-party track on demand, then serve exact ranges even offline.
  // Narration is intentionally NOT part of the installation's mandatory download.
  if(u.pathname.startsWith(ASSETS_PATH+'audio/')&&u.pathname.endsWith('.mp3')){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      let full=await cache.match(u.href);
      if(!full){
        full=await fetch(new Request(u.href,{credentials:'same-origin'}));
        if(full.status!==200)return full;
        try{await cache.put(u.href,full.clone());}catch{/* Listening works even if storage is full. */}
      }
      const range=request.headers.get('range');
      if(!range)return full;
      const bytes=await full.arrayBuffer(),size=bytes.byteLength;
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match||(!match[1]&&!match[2]))return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
      const end=match[1]&&match[2]?Math.min(size-1,Number(match[2])):size-1;
      if(start> end||start>=size)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${size}`}});
      return new Response(bytes.slice(start,end+1),{status:206,headers:{
        'Content-Type':'audio/mpeg','Accept-Ranges':'bytes',
        'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':String(end-start+1),
      }});
    })());
    return;
  }
  if (
    request.mode === "navigate" &&
    (u.pathname === APP_ROOT.pathname || u.pathname === new URL(INDEX_URL).pathname)
  ) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE);
            await cache.put(INDEX_URL, response.clone());
          }
          return response;
        } catch {
          return (await caches.match(INDEX_URL)) || Response.error();
        }
      })(),
    );
    return;
  }
  if (u.pathname.startsWith(ASSETS_PATH))
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE),
          cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })(),
    );
});
