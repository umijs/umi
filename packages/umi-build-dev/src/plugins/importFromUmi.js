import assert from 'assert';
import { isPlainObject } from 'lodash';

const reserveLibrarys = ['umi']; // reserve library
const reserveExportsNames = [
  'Link',
  'NavLink',
  'Redirect',
  'dynamic',
  'router',
  'withRouter',
  'Route',
]; // reserve name
let umiExportsHook = {}; // repeated definition

export function cleanCache() {
  umiExportsHook = {};
}

export function generateExports(item) {
  assert(item.source, 'source should be supplied.');
  assert(item.exportAll || item.specifiers, 'exportAll or specifiers should be supplied.');
  assert(
    !reserveLibrarys.includes(item.source),
    `${item.source} is reserve library, Please don't use it.`,
  );
  if (item.exportAll) {
    return `export * from '${item.source}';`;
  }
  assert(
    Array.isArray(item.specifiers),
    `specifiers should be Array, but got ${item.specifiers.toString()}.`,
  );
  const specifiersStrArr = item.specifiers.map(specifier => {
    if (typeof specifier === 'string') {
      assert(
        !reserveExportsNames.includes(specifier),
        `${specifier} is reserve name, you can use 'exported' to set alias.`,
      );
      assert(
        !umiExportsHook[specifier],
        `${specifier} is Defined, you can use 'exported' to set alias.`,
      );
      umiExportsHook[specifier] = true;
      return specifier;
    } else {
      assert(
        isPlainObject(specifier),
        `Configure item context should be Plain Object, but got ${specifier}.`,
      );
      assert(specifier.local && specifier.exported, 'local and exported should be supplied.');
      return `${specifier.local} as ${specifier.exported}`;
    }
  });
  return `export { ${specifiersStrArr.join(', ')} } from '${item.source}';`;
}

export default function(api) {
  api.onGenerateFiles(() => {
    generateUmiExports();
  });

  const generateUmiExports = () => {
    cleanCache();
    const umiExports = api
      .applyPlugins('addUmiExports', {
        initialValue: [],
      })
      .map(generateExports);
    api.writeTmpFile('umiExports.ts', umiExports.join('\n'));
  };
}
