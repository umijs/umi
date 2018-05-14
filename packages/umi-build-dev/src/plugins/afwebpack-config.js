import getUserConfigPlugins from 'af-webpack/getUserConfigPlugins';

const plugins = getUserConfigPlugins();

function noop() {
  return true;
}

const excludes = ['entry', 'outputPath', 'hash'];

export default api => {
  api.register('modifyConfigPlugins', ({ memo }) => {
    plugins.forEach(({ name, validate = noop }) => {
      if (!excludes.includes(name)) {
        memo.push(() => ({
          name,
          validate,
          onChange() {
            api.service.restart(`${name} changed`);
          },
        }));
      }
    });
    return memo;
  });
};
