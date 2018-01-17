const btn = document.getElementById('btn');
const img = document.getElementById('img');

btn.addEventListener('click', () => {
  img.innerHTML =
    '<img src="http://localhost:8888/test-sw/static/a.png" width="100" height="100" />';
});

navigator.serviceWorker
  .register('http://localhost:8888/test-sw/service-worker.js', {})
  .then(() => {
    console.log('register success!');
  })
  .catch(e => {
    console.error('failed', e);
  });
