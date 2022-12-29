type IExternal = Record<string, string> | Function;
type IExternals = IExternal[] | IExternal;

export function isExternals({
  value,
  externals,
}: {
  value: string;
  externals: IExternals;
}) {
  const externalsArr = Array.isArray(externals) ? externals : [externals];
  for (const external of externalsArr) {
    if (isExternal({ value, external })) {
      return true;
    }
  }
  return false;
}

export function isExternal({
  value,
  external,
}: {
  value: string;
  external: IExternal;
}) {
  if (typeof external === 'object') {
    return !!external[value];
  } else if (typeof external === 'function') {
    let ret = false;
    external(
      {
        __mfsu: true,
        context: '',
        request: value,
        contextInfo: {
          issuer: '',
        },
        dependencyType: 'esm',
      },
      (_error: any, result: any) => {
        ret = !!result;
      },
    );
    return ret;
  } else {
    return false;
  }
}
