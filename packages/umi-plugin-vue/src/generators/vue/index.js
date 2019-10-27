import { join, basename } from 'path';
import * as randomColor from 'random-color';
import * as assert from 'assert';
import chalk from 'chalk';

export default api => {
  const { paths, config, log } = api;

  const absTemplatePath = join(__dirname, './templates');

  return class Generator extends api.Generator {
    constructor(args, options) {
      super(args, options);

      assert(
        typeof this.args[0] === 'string',
        `
${chalk.underline.cyan('name')} should be supplied

Example:

  umi g vue users
        `.trim(),
      );
      if (config.routes) {
        log.warn(
          `You should config the routes in config.routes manunally since ${chalk.red(
            'config.routes',
          )} exists`,
        );
        console.log();
      }
    }

    writing() {
      const path = this.args[0].toString();

      const context = {
        name: basename(path),
        color: randomColor().hexString(),
      };

      const name = context.name;

      try {
        this.fs.copyTpl(
          join(absTemplatePath, 'index.vue.tpl'),
          join(paths.absPagesPath, name, `index.vue`),
          context,
        );
      } catch (e) {
        console.error(e);
      }

      if (this.options.model) {
        try {
          this.fs.copyTpl(
            join(absTemplatePath, 'model.js.tpl'),
            join(paths.absPagesPath, name, `model.js`),
            context,
          );
        } catch (e) {
          console.error(e);
        }
      }
    }
  };
};
