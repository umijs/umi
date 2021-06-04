import { IApi } from '@umijs/types';
import { Generator, randomColor } from '@umijs/utils';
import { basename, join } from 'path';

export default function ({ api }: { api: IApi }) {
  return class PageGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }

    async writing() {
      const [path] = this.args._;
      const jsExt = this.args.typescript ? '.tsx' : '.js';
      const cssExt = this.args.less ? '.less' : '.css';

      this.copyTpl({
        templatePath: join(__dirname, `page${jsExt}.tpl`),
        target: join(api.paths.absPagesPath!, `${path}${jsExt}`),
        context: {
          path,
          name: basename(path as string),
          cssExt,
        },
      });
      this.copyTpl({
        templatePath: join(__dirname, `page.css.tpl`),
        target: join(api.paths.absPagesPath!, `${path}${cssExt}`),
        context: {
          color: randomColor(),
        },
      });
    }
  };
}
