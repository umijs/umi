import { join, basename } from 'path';
import randomColor from 'random-color';
import assert from 'assert';
import chalk from 'chalk';

export default api => {
  const { paths, config } = api;
  const absTemplatePath = join(__dirname, '../../../../template/generators');

  return class Generator extends api.Generator {
    constructor(args, options) {
      super(args, options);

      assert(
        typeof this.args[0] === 'string',
        `
${chalk.underline.cyan('name')} should be supplied

Example: 

  umi g page users
        `.trim(),
      );
      assert(
        !config.routes,
        `${chalk.underline.cyan('umi g page')} does not work when ${chalk.red(
          'config.routes',
        )} exists`,
      );
    }

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
