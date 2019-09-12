function showUmiUIModal() {
  alert('show umi ui modal');
}

function showBubble() {
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.right = '20px';
  el.style.bottom = '20px';
  el.style.width = '50px';
  el.style.height = '50px';
  el.style.background = 'red';
  el.addEventListener('click', showUmiUIModal);
  document.querySelector('body').appendChild(el);
}

function init() {
  showBubble();
}

init();
