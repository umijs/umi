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
  api.onOptionChange(newOpts => {
    opts = newOpts;
    console.log('set new opts', newOpts);
    api.rebuildTmpFiles();
  });

  api.modifyRoutes(routes => {
    console.log('do modifyRoutes');
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
