const mod = require('module');

const hookPropertyMap = new Map([
  ['@babel/core', require.resolve('@umijs/bundler-utils/compiled/babel/core')],
]);

const resolveFilename = mod._resolveFilename;

export function hook() {
  mod._resolveFilename = function (
    request: string,
    parent: any,
    isMain: boolean,
    options: any,
  ) {
    const hookResolved = hookPropertyMap.get(request);
    if (hookResolved) request = hookResolved;
    return resolveFilename.call(mod, request, parent, isMain, options);
  };
}

export function unhook() {
  mod._resolveFilename = resolveFilename;
}
