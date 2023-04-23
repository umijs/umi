import assert from 'assert';
import { writeFileSync } from 'fs';
import kleur from 'kleur';
import { join } from 'path';
import { transform } from '../jsTransformer';
import { info } from '../logger';
import { Context } from '../types';

export class Runner {
  cwd: string;
  context: Context;
  constructor(opts: { cwd: string; context: Context }) {
    this.cwd = opts.cwd;
    this.context = opts.context;
  }

  run() {
    let count = 1;
    const total = this.context.fileCache.size;
    this.context.fileCache.forEach((code, filePath) => {
      const absFilePath = join(this.cwd, filePath);
      info(kleur.green(`[${count}/${total}] Transform ${filePath}`));
      count += 1;
      const { code: newCode, skip } = this.transform({ code, filePath });
      if (skip) {
        // info(kleur.yellow(`Skip`));
        return;
      }
      assert(newCode, `code should not be null from ${absFilePath}`);
      writeFileSync(absFilePath, newCode, 'utf-8');
    });
  }

  transform(opts: { code: string; filePath: string }) {
    return transform({
      ...opts,
      context: this.context,
    });
  }
}
