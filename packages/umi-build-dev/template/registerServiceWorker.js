
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register(`${process.env.BASE_URL || ''}service-worker.js`)
    //从window.routerBase位置获取更准确
    navigator.serviceWorker.register(window.routerBase + 'service-worker.js')
      .then((reg) => {})
      .catch(e => {});
  });
}
