import { extname } from 'path';

export function getAliasedPath({
  value,
  alias,
}: {
  value: string;
  alias: Record<string, string>;
}) {
  const importValue = value;
  for (const key of Object.keys(alias)) {
    const aliasValue = alias[key];

    // exact alias
    // ref: https://webpack.js.org/configuration/resolve/#resolvealias
    // e.g. foo$: path/to/foo
    if (key.endsWith('$')) {
      if (importValue === key.slice(0, -1)) return aliasValue;
      else continue;
    }

    // e.g. foo: path/to/foo
    if (importValue === key) {
      return aliasValue;
    }

    // e.g. foo: path/to/foo.js
    const slashedKey = isJSFile(aliasValue) ? key : addLastSlash(key);
    if (importValue.startsWith(slashedKey)) {
      return importValue.replace(key, aliasValue);
    }
  }
}

function isJSFile(path: string) {
  return ['.js', '.jsx', '.ts', '.tsx'].includes(extname(path));
}

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}
