import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/routes';

async function render() {
  const context = {
    ...await getRoutes(),
  };
  return renderClient(context);
}

render();
