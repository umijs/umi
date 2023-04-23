#!/usr/bin/env node

// disable since it's conflicted with typescript cjs + dynamic import
// require('v8-compile-cache');

// patch console for debug
// ref: https://remysharp.com/2014/05/23/where-is-that-console-log
if (process.env.DEBUG_CONSOLE) {
  ['log', 'warn', 'error'].forEach((method) => {
    const old = console[method];
    console[method] = function () {
      let stack = new Error().stack.split(/\n/);
      // Chrome includes a single "Error" line, FF doesn't.
      if (stack[0].indexOf('Error') === 0) {
        stack = stack.slice(1);
      }
      const args = [].slice.apply(arguments).concat([stack[1].trim()]);
      return old.apply(console, args);
    };
  });
}

require('../dist/cli/cli')
  .run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
