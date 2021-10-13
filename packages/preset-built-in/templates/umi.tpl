import { renderClient } from '{{{ rendererPath }}}';
import { getRoutes } from './core/routes';

async function render() {
  const routes = await getRoutes();
  const context = {
    routes,
  };
  return renderClient(context);
}

render();
