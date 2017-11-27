import { writeFileSync as writeFile } from 'fs';
import { join } from 'path';

export default function generateRenderConfig(routeConfig, { cwd }) {
  const config = getRenderConfig(routeConfig);
  const outputFilePath = join(cwd, 'dist', 'config.json');
  writeFile(outputFilePath, JSON.stringify(config, null, 2), 'utf-8');
}

export function getRenderConfig(routeConfig) {
  const pages = Object.keys(routeConfig).reduce((memo, key) => {
    const newKey = key.slice(1);
    memo[newKey] = {
      template: newKey,
    };
    return memo;
  }, {});

  return {
    pages,
  };
}
