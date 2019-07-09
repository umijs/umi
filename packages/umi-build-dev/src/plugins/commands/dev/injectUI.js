(() => {
  const IFRAME_WIDTH = 1080;
  const IFRAME_HEIGHT = 600;
  let iframeEl = null;

  function showIframe() {
    if (!iframeEl) {
      const { clientWidth, clientHeight } = document.documentElement;
      iframeEl = document.createElement('iframe');
      iframeEl.src = 'http://localhost:8001/?headless';
      iframeEl.style.position = 'fixed';
      iframeEl.style.zIndex = 10000;
      iframeEl.style.width = `${IFRAME_WIDTH}px`;
      iframeEl.style.height = `${IFRAME_HEIGHT}px`;
      iframeEl.style.left = `${(clientWidth - IFRAME_WIDTH) / 2}px`;
      iframeEl.style.top = `${(clientHeight - IFRAME_HEIGHT) / 2}px`;
      iframeEl.style.border = '1px solid #ccc';
      iframeEl.style.boxShadow = '0 0 5px #999';
      document.documentElement.appendChild(iframeEl);
    } else {
      iframeEl.style.display = iframeEl.style.display !== 'none' ? 'none' : 'block';
    }
  }

  window.addEventListener('keydown', e => {
    if (e.keyCode === 27 && iframeEl) {
      iframeEl.style.display = 'none';
    }
  });

  const el = document.createElement('div');
  el.innerHTML = `<img src="https://cdn.nlark.com/yuque/0/2019/png/86025/1560238206879-9374a3a5-2346-4623-b508-da6e16c7cc1f.png" width="40" />`;
  el.style.position = 'fixed';
  el.style.zIndex = 10000;
  el.style.right = '30px';
  el.style.bottom = '30px';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 0 5px #999';
  el.addEventListener('click', showIframe);
  document.documentElement.appendChild(el);
})();
