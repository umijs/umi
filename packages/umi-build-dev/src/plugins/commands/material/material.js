import { join, basename } from 'path';

// const debug = require('debug')('umi-build-dev:MaterialGenerator');

export default api => {
  const { paths } = api;

  return class Generator extends api.Generator {
    writing() {
      // TODO
      // const path = this.args[0].toString();
      // const name = basename(path);
      // this.fs.copyTpl(join(paths.absPagesPath, `${path}.js`), {
      //   name,
      // });
    }
  };
};
