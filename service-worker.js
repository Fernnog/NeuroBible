// service-worker.js - V1.4.2 (Swipe UX & Mobile Ergonomics)

const CACHE_NAME = 'neurobible-v1.4.2-SWIPE-UX';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    // Arquivos de Estilo (Nova Estrutura)
    './css/structure.css',
    './css/components.css',
    // Assets Estáticos
    './manifest.json',
    './images/logo.png',
    './images/favicon.ico',
    // Arquivos da Arquitetura Modular
    './js/main.js',
    './js/core.js',
    './js/storage.js',
    './js/ui-dashboard.js',
    './js/flashcard.js',
    './js/srs-engine.js',
    './js/utils.js',
    './js/changelog.js',
    './js/firebase.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching modular assets (v1.4.2) with HTTP cache bypass');
                const freshRequests = ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' }));
                return cache.addAll(freshRequests);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
