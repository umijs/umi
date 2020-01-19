import { join } from 'path';
import { IApi } from '@umijs/types';
import { Generator, randomColor } from '@umijs/utils';

export default function({ api }: { api: IApi }) {
  return class PageGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }

    writing() {
      const [name] = this.args._;
      const jsExt = this.args.typescript ? '.tsx' : '.js';
      const cssExt = this.args.less ? '.less' : '.css';

      this.copyTpl({
        templatePath: join(__dirname, `page${jsExt}.tpl`),
        target: join(api.paths.absPagesPath!, `${name}${jsExt}`),
        context: {
          name,
          cssExt,
        },
      });
      this.copyTpl({
        templatePath: join(__dirname, `page.css.tpl`),
        target: join(api.paths.absPagesPath!, `${name}${cssExt}`),
        context: {
          color: randomColor(),
        },
      });
    }
  };
}
