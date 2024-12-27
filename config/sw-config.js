module.exports = {
  globDirectory: 'build/',
  dontCacheBustURLsMatching: /\.\w{8}\./,
  globIgnores: [
    'asset-manifest.json',
    '**/index.html',
    '**/main.**.js',
    '**/main.**.css',
    '**/**.chunk.js',
    '**/*.map',
    '**/*.svg',
    '**/*.png',
    '**/*.jpeg',
    '**/*.jpg'
  ],
  globPatterns: [
    '**',
    'manifest.json',
  ],
  swDest: 'build/service-worker.js',
  swSrc: 'config/sw.js',
  injectionPointRegexp: /(setPrecacheList\()\s*\[\s*\]\s*(\))/,
};