import { join, dirname } from 'path';
import { IApi } from '@umijs/types';
import { Generator, chalk } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { getHtmlGenerator } from '../../htmlUtils';
import { mkdirp } from '@umijs/utils';

export default function ({ api }: { api: IApi }) {
  return class PageGenerator extends Generator {
    constructor(opts: any) {
      super(opts);
    }

    async writing() {
      const jsExt = this.args.typescript ? '.tsx' : '.js';
      const cssExt = this.args.less ? '.less' : '.css';

      const html = getHtmlGenerator({ api });
      const content = await html.getContent({
        route: { path: (this.args.path as string) || '/' },
        noChunk: true,
      });
      const targetPath = join(api.paths.absOutputPath!, 'index.html');
      mkdirp.sync(dirname(targetPath));
      console.log(`${chalk.green('Write:')} dist/index.html`);
      writeFileSync(targetPath, content, 'utf-8');
    }
  };
}
