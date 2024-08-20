if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('app_sw.js')
	.then((reg) => console.log('service worker registered', reg.scope))
	.catch((err) => console.log('service worker not registered', err));
}