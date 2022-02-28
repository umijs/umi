export function getAliasedPath({
  value,
  alias,
}: {
  value: string;
  alias: Record<string, string>;
}) {
  const importValue = value;
  // equal alias
  if (alias[value]) {
    return alias[value];
  }
  for (const key of Object.keys(alias)) {
    const aliasValue = alias[key];

    // exact alias
    // ref: https://webpack.js.org/configuration/resolve/#resolvealias
    // e.g. foo$: path/to/foo
    if (key.endsWith('$')) {
      if (importValue === key.slice(0, -1)) return aliasValue;
      else continue;
    }

    // e.g. foo: path/to/foo.js
    if (importValue.startsWith(addLastSlash(key))) {
      return importValue.replace(key, aliasValue);
    }
  }
}

function addLastSlash(path: string) {
  return path.endsWith('/') ? path : `${path}/`;
}
