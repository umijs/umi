import { writeFileSync } from 'fs';
import { join } from 'path';

export default function generateRenderConfig(service) {
  const { cwd, routes } = service;
  const config = getRenderConfig(routes);
  const outputFilePath = join(cwd, 'dist', 'config.json');
  writeFileSync(outputFilePath, JSON.stringify(config, null, 2), 'utf-8');
}

function getRenderConfig(routes) {
  const pages = routes.reduce((memo, route) => {
    const { path } = route;
    let key = path.slice(1);
    if (key === '') {
      key = 'index.html';
    }
    memo[key] = {
      template: key,
    };
    return memo;
  }, {});
  return {
    pages,
  };
}
