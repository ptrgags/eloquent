if('serviceWorker' in navigator) {window.addEventListener('load', () => {navigator.serviceWorker.register('/eloquent/sw.js', { scope: '/eloquent/' })})}