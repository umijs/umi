import { renderClient } from '{{{ rendererPath }}}';

function render() {
  const context = {
    routes: [],
  };
  return renderClient(context);
}

render();
