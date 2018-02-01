
window.g_history.listen(function(location) {
  new Image().src = (window.routerBase + location.pathname).replace(/\/\//g, '/');
});
