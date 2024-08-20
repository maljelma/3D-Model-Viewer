const version = "1.0"
const staticCache = `static-cache-v${version}`;
const dynamicCache = `dynamic-v${version}`;
const fallbackCache = `fallback-v${version}`;

const fallbackAssets = [
    "app/fallback/fallback.html",
];

const staticAssets = [
];

// function to limit cache assets count/size
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if (size != -1 && keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
}

// runs on [first time, browser cache cleared, this file content changed]
self.addEventListener('install', function (event) {
    event.waitUntil(
        Promise.all(
            [
                caches.open(fallbackCache).then(function (cache) {
                    console.log("caching fallback assets");
                    return cache.addAll(fallbackAssets);
                }),
                caches.open(staticCache).then(function (cache) {
                    console.log("caching static assets");
                    return cache.addAll(staticAssets);
                }),
            ]
        )
    );
});

// activate service worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        // remove all other versions of caches
        caches.keys().then( keys => {
            return Promise.all(
                keys
                .filter(key => key !== fallbackCache && key !== staticCache && key !== dynamicCache)
                .map(key => caches.delete(key))
            )
        })
    )
});

// runs on [every fetch request]
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request).then(async (fetchRes) => {
                return caches.open(dynamicCache).then(cache =>{
                    cache.put(event.request.url,fetchRes.clone());
                    limitCacheSize(dynamicCache, -1);
                    return fetchRes;
                });
            });
        })
        .catch (() =>{
            if (event.request.url.indexOf(".html") > -1){
                return caches.match('app/fallback/fallback.html');
            }
        })
    );
});