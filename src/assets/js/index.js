import '../scss/app.scss';

if ('serviceWorker' in window.navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
