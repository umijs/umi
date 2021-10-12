import importLazyInternal from '../compiled/import-lazy';

export function importLazy(
  moduleName: string,
  require: (id: string) => unknown,
): any {
  const importLazyLocal: (moduleName: string) => unknown =
    importLazyInternal(require);
  return importLazyLocal(moduleName);
}
