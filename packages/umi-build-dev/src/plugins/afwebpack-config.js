import getUserConfigPlugins from 'af-webpack/getUserConfigPlugins';

const plugins = getUserConfigPlugins();

function noop() {
  return true;
}

const excludes = ['entry', 'outputPath', 'hash'];

export default function(api) {
  const {
    utils: { debug },
  } = api;
  api.register('modifyConfigPlugins', ({ memo }) => {
    plugins.forEach(({ name, validate = noop }) => {
      if (!excludes.includes(name)) {
        memo.push(() => ({
          name,
          validate,
          onChange(newConfig) {
            try {
              debug(
                `Config ${name} changed to ${JSON.stringify(newConfig[name])}`,
              );
            } catch (e) {}
            if (name === 'proxy') {
              global.g_umi_reloadProxy(newConfig[name]);
            } else {
              api.service.restart(`${name} changed`);
            }
          },
        }));
      }
    });
    return memo;
  });
}
