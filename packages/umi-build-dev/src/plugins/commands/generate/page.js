import { join, basename } from 'path';
import randomColor from 'random-color';

export default api => {
  const { paths } = api;
  const absTemplatePath = join(__dirname, '../../../../template/generators');

  return class Generator extends api.Generator {
    constructor(args, options) {
      super(args, options);
    }

    configuring() {}

    writing() {
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
