
window.g_history.listen((location) => {
  new Image().src = (window.routerBase + location.pathname).replace(/\/\//g, '/');
});
