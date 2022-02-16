#!/usr/bin/env node

// disable since it's conflicted with typescript cjs + dynamic import
// require('v8-compile-cache');

// patch console for debug
if (process.env.DEBUG_CONSOLE) {
  ['log', 'warn', 'error'].forEach((methodName) => {
    const originalMethod = console[methodName];
    console[methodName] = (...args) => {
      let initiator = 'unknown place';
      try {
        throw new Error();
      } catch (e) {
        if (typeof e.stack === 'string') {
          let isFirst = true;
          for (const line of e.stack.split('\n')) {
            const matches = line.match(/^\s+at\s+(.*)/);
            if (matches) {
              if (!isFirst) {
                // first line - current function
                // second line - caller (what we are looking for)
                initiator = matches[1];
                break;
              }
              isFirst = false;
            }
          }
        }
      }
      originalMethod.apply(console, [...args, '\n', `  at ${initiator}`]);
    };
  });
}

require('../dist/cli/cli')
  .run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
