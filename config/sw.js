importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

// cache all localised files
const resRegexString = 'res\/AllLocales/.*\/(.*).xml';
const RUNTIME_CACHE = 'runtimeCache';

//Cache images
workbox.routing.registerRoute(
  new RegExp('(https:\/\/storage.googleapis.com)|(.*(?:png|jpg|jpeg|svg)$)'),
  workbox.strategies.cacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 100,
        maxAgeSeconds: 20 * 24 * 60 * 60, // 20 Days
      }),
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
    ],
  })
);

const cacheFirstRegex = [
  '^https://fonts.googleapis.com/icon?family=Material+Icons(.*)',
  '^https://fonts.gstatic.com/s/materialicons(.*)',
];

const cacheWithRevalidateRegex = [
  resRegexString
];

/**
 * Cache material icons
 */
workbox.routing.registerRoute(
    new RegExp(cacheFirstRegex.join('|')),
    workbox.strategies.cacheFirst({
      cacheName: RUNTIME_CACHE,
    }),
);

workbox.routing.registerRoute(
  new RegExp(cacheWithRevalidateRegex.join('|')),
  workbox.strategies.staleWhileRevalidate({
    cacheName: RUNTIME_CACHE,
  }),
);

/*
 This funtion does nothing now as we are not precaching any files.
 Precahed files use cache-first strategy.
 This is not a good choice for localised files. But this can be used for non-critical files that dont need an immediate update.
*/
function setPrecacheList(list) {
  const resRegex = new RegExp(resRegexString);
  var localeFiles = [];
  list.map(function (x) {
    var match = x.url.match(resRegex);
    if (!match) {
      localeFiles.push(x);
    }
  });

  workbox.precaching.precacheAndRoute(localeFiles);
}

setPrecacheList([]);
