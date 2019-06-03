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
      const jsxExt = this.isTypeScript ? 'tsx' : 'js';
      const cssExt = this.options.less ? 'less' : 'css';
      const context = {
        name: 'index',
        title: `Global Layout`,
        color: randomColor().hexString(),
        isTypeScript: this.isTypeScript,
        jsxExt,
        cssExt,
      };
      if (this.options.global) {
        assert(
          !this.args.length,
          `You don't need to specify the path with --global, e.g. umi g layout --global`,
        );
        this.fs.copyTpl(
          this.templatePath('layout.js.tpl'),
          join(paths.absSrcPath, `layouts`, `index.${jsxExt}`),
          context,
        );
        this.fs.copyTpl(
          this.templatePath('layout.css.tpl'),
          join(paths.absSrcPath, `layouts`, `index.${cssExt}`),
          context,
        );
        return;
      }

      const path = this.args[0];
      assert(typeof path === 'string', `You should specify the path, e.g. umi g layout abc`);
      this.fs.copyTpl(
        this.templatePath('layout.js.tpl'),
        join(paths.absPagesPath, path, `_layout.${jsxExt}`),
        {
          ...context,
          name: '_layout',
          title: `Layout for ${path}`,
        },
      );
      this.fs.copyTpl(
        this.templatePath('layout.css.tpl'),
        join(paths.absPagesPath, path, `_layout.${cssExt}`),
        context,
      );
    }
  };
};
