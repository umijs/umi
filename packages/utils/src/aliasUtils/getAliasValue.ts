import path from 'path';

export function getAliasValue(opts: {
  imported: string;
  alias: Record<string, string>;
}) {
  const { imported, alias } = opts;
  // equal alias
  if (alias[imported]) {
    return alias[imported];
  }
  for (const key of Object.keys(alias)) {
    const value = alias[key];

    // exact alias
    if (key.endsWith('$')) {
      if (imported === key.slice(0, -1)) {
        return value;
      } else {
        continue;
      }
    }

    // prefix alias
    // e.g. react/ : /dir/
    //      react/jsx-runtime : /dir/jsx-runtime
    const keyWithLastSlash = addLastSlash(key);
    if (imported.startsWith(keyWithLastSlash)) {
      const isWinPath =
        process.platform === 'win32' && value.includes(path.sep);
      if (isWinPath) {
        return path.join(value, imported.slice(keyWithLastSlash.length));
      }
      return imported.replace(keyWithLastSlash, addLastSlash(value));
    }
  }
}

function addLastSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}
