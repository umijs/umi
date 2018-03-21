import assert from 'assert';
import isPlainObject from 'is-plain-object';

function optsToArray(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

function exclude(routes, excludes) {
  return routes.filter(route => {
    for (const exclude of excludes) {
      if (typeof exclude === 'function' && exclude(route)) {
        return false;
      }
      if (exclude instanceof RegExp && exclude.test(route.component)) {
        return false;
      }
    }

    if (route.routes) {
      route.routes = exclude(route.routes, excludes);
    }

    return true;
  });
}

export default function(api, opts) {
  api.register('modifyRoutes', ({ memo }) => {
    // opts.exclude
    memo = exclude(memo, optsToArray(opts.exclude));

    // opts.include
    for (const include of optsToArray(opts.include)) {
      if (isPlainObject(include)) {
        memo = [...memo, include];
      }
      if (typeof include === 'string') {
        throw new Error(
          'opts.include with string not support, please wait for next version.',
        );
      }
    }

    // opts.update
    if (opts.update) {
      assert(
        typeof opts.update === 'function',
        `opts.update should be function, but got ${opts.update}`,
      );
      memo = opts.update(memo);
    }

    return memo;
  });
}
