import assert from 'assert';
import exclude from './exclude';

function optsToArray(item) {
  if (!item) return [];
  if (Array.isArray(item)) {
    return item;
  } else {
    return [item];
  }
}

export default function(api, opts) {
  api.modifyRotues(routes => {
    routes = exclude(routes, optsToArray(opts.exclude));

    if (opts.update) {
      assert(
        typeof opts.update === 'function',
        `opts.update should be function, but got ${opts.update}`,
      );
      routes = opts.update(routes);
    }

    return routes;
  });
}
