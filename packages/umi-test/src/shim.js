import '@babel/polyfill';

/* eslint-disable import/first */
global.requestAnimationFrame =
  global.requestAnimationFrame ||
  function requestAnimationFrame(callback) {
    setTimeout(callback, 0);
  };
