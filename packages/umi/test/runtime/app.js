export function patchRoutes(config) {
  console.log(config);
}

export function render(oldRender) {
  console.log('wait for 1s');
  setTimeout(() => {
    console.log('do render');
    oldRender();
  }, 1000);
}

export function rootContainer(container) {
  const React = require('react');
  function Provider(props) {
    return (
      <>
        <h1 id="provider">Provider</h1>
        <div>{props.children}</div>
      </>
    );
  }
  return React.createElement(Provider, null, container);
}
