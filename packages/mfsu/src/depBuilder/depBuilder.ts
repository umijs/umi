import webpack, { container } from '@umijs/bundler-webpack/compiled/webpack';
import { lodash } from '@umijs/utils';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { REMOTE_FILE_FULL } from '../constants';
import { Dep } from '../dep/dep';
import { MFSU } from '../index';

interface IOpts {
  mfsu: MFSU;
}

export class DepBuilder {
  public opts: IOpts;
  public completeFns: Function[] = [];
  public isBuilding = false;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  async build(opts: { deps: Dep[] }) {
    this.isBuilding = true;
    await this.writeMFFiles({ deps: opts.deps });

    const config = this.getWebpackConfig({ deps: opts.deps });
    return new Promise((resolve, reject) => {
      const compiler = webpack(config);
      compiler.run((err, stats) => {
        this.isBuilding = false;
        this.completeFns.forEach((fn) => fn());
        this.completeFns = [];

        if (err || stats?.hasErrors()) {
          if (err) {
            reject(err);
          }
          if (stats) {
            const errorMsg = stats.toString('errors-only');
            // console.error(errorMsg);
            reject(new Error(errorMsg));
          }
        } else {
          resolve(stats);
        }
        compiler.close(() => {});
      });
    });
  }

  async writeMFFiles(opts: { deps: Dep[] }) {
    const tmpBase = this.opts.mfsu.opts.tmpBase!;

    // expose files
    for (const dep of opts.deps) {
      const content = await dep.buildExposeContent();
      writeFileSync(join(tmpBase, dep.filePath), content, 'utf-8');
    }

    // index file
    writeFileSync(join(tmpBase, 'index.js'), '"😛"', 'utf-8');
  }

  getWebpackConfig(opts: { deps: Dep[] }) {
    const mfName = this.opts.mfsu.opts.mfName;
    const depConfig = lodash.cloneDeep(this.opts.mfsu.depConfig!);

    // depConfig.stats = 'none';
    depConfig.entry = join(this.opts.mfsu.opts.tmpBase!, 'index.js');
    depConfig.output!.path = this.opts.mfsu.opts.tmpBase!;
    // disable devtool
    depConfig.devtool = false;
    // disable library
    // library 会影响 external 的语法，导致报错
    // ref: https://github.com/umijs/plugins/blob/6d3fc2d/packages/plugin-qiankun/src/slave/index.ts#L83
    if (depConfig.output?.library) delete depConfig.output.library;
    if (depConfig.output?.libraryTarget) delete depConfig.output.libraryTarget;

    depConfig.plugins = depConfig.plugins || [];
    const exposes = opts.deps.reduce<Record<string, string>>((memo, dep) => {
      exposes[`./${dep.shortFile}`] = join(
        this.opts.mfsu.opts.tmpBase!,
        dep.filePath,
      );
      return memo;
    }, {});
    depConfig.plugins.push(
      new container.ModuleFederationPlugin({
        library: {
          type: 'global',
          name: mfName,
        },
        name: mfName,
        filename: REMOTE_FILE_FULL,
        exposes,
      }),
    );
    return depConfig;
  }
}
