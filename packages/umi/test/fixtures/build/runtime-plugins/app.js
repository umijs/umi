export function patchRoutes(config) {
  window.g_patch_routes = config;
}

export function render(oldRender) {
  const el = document.createElement('h3');
  el.innerHTML = 'render';
  document.getElementsByTagName('body')[0].appendChild(
    el
  )
  oldRender();
}

export function rootContainer(container) {
  const React = require('react');
  function Provider(props) {
    return (
      <>
        <h2>rootContainer</h2>
        <div>{props.children}</div>
      </>
    );
  }
  return React.createElement(Provider, null, container);
}
