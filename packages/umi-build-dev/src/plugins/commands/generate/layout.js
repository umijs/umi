import { join } from 'path';
import randomColor from 'random-color';
import assert from 'assert';
import chalk from 'chalk';

export default api => {
  const { paths, config, log } = api;

  return class Generator extends api.Generator {
    constructor(args, options) {
      super(args, options);

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
      if (this.options.global) {
        assert(
          !this.args.length,
          `You don't need to specify the path with --global, e.g. umi g layout --global`,
        );
        this.fs.copyTpl(
          join(__dirname, 'templates', 'layout.js.tpl'),
          join(paths.absSrcPath, `layouts`, `index.js`),
          {
            name: 'index',
            title: `Global Layout`,
          },
        );
        this.fs.copyTpl(
          join(__dirname, 'templates', 'layout.css.tpl'),
          join(paths.absSrcPath, `layouts`, `index.css`),
          {
            color: randomColor().hexString(),
          },
        );
        return;
      }

      const path = this.args[0];
      assert(
        typeof path === 'string',
        `You should specify the path, e.g. umi g layout abc`,
      );
      this.fs.copyTpl(
        join(__dirname, 'templates', 'layout.js.tpl'),
        join(paths.absPagesPath, path, `_layout.js`),
        {
          name: '_layout',
          title: `Layout for ${path}`,
        },
      );
      this.fs.copyTpl(
        join(__dirname, 'templates', 'layout.css.tpl'),
        join(paths.absPagesPath, path, `_layout.css`),
        {
          color: randomColor().hexString(),
        },
      );
    }
  };
};
