export default () => {
  const el = document.scrollingElement || document.documentElement;
  if (el.scrollTop !== 0) {
    el.scrollTop = 0;
  }
};
