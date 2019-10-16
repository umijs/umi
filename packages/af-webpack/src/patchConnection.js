/* eslint-disable */

let el = null;

export function showLoading() {
  el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = 0;
  el.style.top = 0;
  el.style.width = '100%';
  el.style.background = '#fff1b8';
  el.style.zIndex = 2147483647000000;
  el.style.color = '#613400';
  el.style.textAlign = 'center';
  el.style.fontSize = '18px';
  el.style.fontFamily = 'Consolas, Menlo, Courier, monospace';
  el.style.padding = '8px 0';
  el.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.1)';
  el.innerHTML = 'Disconnected from the devServer, trying to reconnect...';
  document.body.appendChild(el);
}

export function hideLoading() {
  el.parentNode.removeChild(el);
}

export function connectServer(onSuccess) {
  let count = 0;

  function retry() {
    if (++count > 20) {
      el.innerHTML = 'Disconnected from the devServer.';
      return;
    }

    if (window.fetch) {
      window
        .fetch(window.location.href)
        .then(onSuccess)
        .catch(() => {
          setTimeout(retry, 1000);
        });
    }
  }

  retry();
}
