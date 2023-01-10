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
      const valueWithLastSlash = addLastSlash(value);
      return imported.replace(keyWithLastSlash, valueWithLastSlash);
    }
  }
}

function addLastSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`;
}
