/**
 * ref:
 * 1. https://rushstack.io/pages/api/node-core-library.import.lazy/
 * 2. https://github.com/microsoft/rushstack/blob/90301e9/libraries/node-core-library/src/Import.ts#L175
 */

import importLazyInternal from '../compiled/import-lazy';

export function importLazy(
  moduleName: string,
  requireFn?: (id: string) => unknown,
): any {
  const importLazyLocal: (moduleName: string) => unknown = importLazyInternal(
    requireFn || require,
  );
  return importLazyLocal(moduleName);
}
