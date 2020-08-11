//cache while offline

let CACHE_NAME = "budget-tracker-cache";
const DATA_CACHE_NAME = "data-cache";

let urlsToCache = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

//install
self.addEventListener("install", function(event) {
    event.waitUntil (
        caches.open(CACHE_NAME).then(function(cache) {
            console.log("Cache Open");
            return cache.addAll(urlsToCache);
        })
    );
});


//cache requests to api routes
self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request).then(response => {
                    //if response 200, clone
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone())
                    }
                    return response;
                })
                //this will catch an error to network and pull from cache instead
                .catch(err => {
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }

    //go to main html page in cache
    event.respondWith(fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
            if (response) {
                return response;
            } else if (event.request.headers.get("accept").includes("text.html")) {
                return caches.match("/");
            }
        });
        })
    );
});