import { join, basename } from 'path';
import randomColor from 'random-color';
import assert from 'assert';

export default api => {
  const { paths, config } = api;
  const absTemplatePath = join(__dirname, '../../../../template/generators');

  return class Generator extends api.Generator {
    constructor(args, options) {
      super(args, options);

      if (config.routes) {
        throw new Error(`umi g page does not work when config.routes exists`);
      }
    }

    configuring() {}

    writing() {
      assert(typeof this.args[0] === 'string', `name should be supplied`);

      const path = this.args[0].toString();
      const name = basename(path);
      this.fs.copyTpl(
        join(absTemplatePath, 'page.js'),
        join(paths.absPagesPath, `${path}.js`),
        {
          name,
        },
      );
      this.fs.copyTpl(
        join(absTemplatePath, 'page.css'),
        join(paths.absPagesPath, `${path}.css`),
        {
          color: randomColor().hexString(),
        },
      );
    }
  };
};
