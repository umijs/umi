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

function exclude(routes, excludes, winPath) {
  return routes.filter(route => {
    for (const exclude of excludes) {
      if (typeof exclude === 'function' && exclude(route)) {
        return false;
      }
      if (
        !route.component.startsWith('() =>') &&
        exclude instanceof RegExp &&
        exclude.test(winPath(route.component))
      ) {
        return false;
      }
    }

    if (route.routes) {
      route.routes = exclude(route.routes, excludes, winPath);
    }

    return true;
  });
}

export default function(api, opts) {
  const { winPath } = api.utils;
  api.register('modifyRoutes', ({ memo }) => {
    // opts.exclude
    memo = exclude(memo, optsToArray(opts.exclude), winPath);

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

    // 权限路由
    // TODO: use opts from opts.authorize
    if (opts.authorize) {
      assert(
        Array.isArray(opts.authorize),
        `The authorize must be Array, but got ${opts.authorize}`,
      );
      patchRoutes(memo, opts.authorize);
    }
    return memo;
  });
}
function patchRoutes(routes, authorize) {
  routes.forEach(route => {
    if (route.routes) {
      patchRoutes(route.routes, authorize);
    } else {
      authorize.forEach(auth => {
        const { guard, include, exclude } = auth;
        //exclude和include可能是正则表达式或者字符串
        if (
          (!exclude ||
            (exclude instanceof RegExp && !exclude.test(route.path)) ||
            (route.path &&
              typeof exclude === 'string' &&
              route.path.indexOf(exclude) === -1)) &&
          ((include &&
            (include instanceof RegExp && include.test(route.path))) ||
            (route.path &&
              typeof include === 'string' &&
              route.path.indexOf(include) !== -1))
        ) {
          route.Route = guard;
        }
      });
    }
  });
}
