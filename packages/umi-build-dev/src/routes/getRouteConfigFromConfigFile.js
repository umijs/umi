import assert from 'assert';
import { readFileSync } from 'fs';

export default configFile => {
  const routesConfig = JSON.parse(readFileSync(configFile));
  assert(Array.isArray(routesConfig), `routes config must be Array, but got ${routesConfig}`);
  return routesConfig;
};
