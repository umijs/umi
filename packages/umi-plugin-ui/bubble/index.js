const el = document.createElement('div');
el.style.position = 'fixed';
el.style.right = '20px';
el.style.bottom = '20px';
el.style.width = '50px';
el.style.height = '50px';
el.style.background = 'red';
el.addEventListener('click', () => {
  alert('umi ui bubble');
});
document.querySelector('body').appendChild(el);
