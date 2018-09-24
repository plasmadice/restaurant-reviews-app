let staticCacheName = 'restaurant-static-v';
// Generate random cache ID for new cache
const cacheId = Math.floor(Math.random() * 20000);
staticCacheName += cacheId;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
    return cache.addAll([
      'index.html',
      'restaurant.html',
      '/css/styles.css',
      '/css/responsive.css',
      '/data/restaurants.json',
      '/js/dbhelper.js',
      '/js/main.js',
      '/js/restaurant_info.js',
      '/img/*',
      '//normalize-css.googlecode.com/svn/trunk/normalize.css',
    ]).catch(error => {
      console.log('Error: ', error);
    });
  }));
});


// Delete outdated caches
// Went with stock MDN cache removal
this.addEventListener('activate', function(event) {
    const cacheWhitelist = [staticCacheName];
  
    event.waitUntil(
      caches.keys().then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (cacheWhitelist.indexOf(key) === -1) {
            return caches.delete(key);
          }
        }));
      })
    );
});

// Checks cache for content before properly fetching
self.addEventListener('fetch', (event) => {
    // Was getting an issue where it would try to fetch a chrome extension
    // This would shut everything down, so now it filters chrome extensions
    if (!event.request.url.startsWith('chrome-extension')) {
        event.respondWith(    
            caches.match(event.request)
            .then(res => {
                if (res !== undefined) {
                  return res;
                } else {        
                  return fetch(event.request).then(response => {
                        const responseClone = response.clone();
                        
                        caches.open(staticCacheName)
                            .then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        return response;
                      }
                  );
                }
            })
        );
    }
});



 
