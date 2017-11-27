/* eslint-disable */

let el = null;

function showLoading() {
  el = document.createElement('div');
  el.style.position = 'absolute';
  el.style.left = 0;
  el.style.top = '50%';
  el.style.marginTop = '-10px';
  el.style.width = '100%';
  el.style.height = '20px';
  el.style.background = 'yellow';
  el.style.zIndex = 2147483647000000;
  el.style.color = '#8b0000';
  el.style.textAlign = 'center';
  el.style.fontSize = '18px';
  el.style.padding = '4px 0';
  el.style.boxShadow = '0px 0px 20px #00000054';
  el.innerHTML = '已和开发服务器断开，正在尝试重新连接。。。';
  document.body.appendChild(el);
}

function hideLoading() {
  el.parentNode.removeChild(el);
}

function connectServer(onSuccess) {
  fetch(window.location.href)
    .then(onSuccess)
    .catch(() => {
      setTimeout(() => {
        connectServer(onSuccess);
      }, 1000);
    });
}

export default function(connection) {
  const oldOnclose = connection.onclose;
  connection.onclose = () => {
    oldOnclose();
    showLoading();
    connectServer(() => {
      window.location.reload();
    });
  };
}
