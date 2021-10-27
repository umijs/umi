import { importLazy } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../types';
import { clearTmp } from '../utils/clearTmp';

const bundlerWebpack: typeof import('@umijs/bundler-webpack') = importLazy(
  '@umijs/bundler-webpack',
);
const bundlerVite: typeof import('@umijs/bundler-vite') = importLazy(
  '@umijs/bundler-vite',
);

export default (api: IApi) => {
  api.registerCommand({
    name: 'build',
    description: 'build app for production',
    details: `
umi build

# build without compression
COMPRESS=none umi build

# clean and build
umi build --clean
`,
    async fn() {
      // clear tmp except cache
      clearTmp(api.paths.absTmpPath);

      // generate files
      async function generate(opts: { isFirstTime?: boolean; files?: any }) {
        api.applyPlugins({
          key: 'onGenerateFiles',
          args: {
            files: opts.files || null,
            isFirstTime: opts.isFirstTime,
          },
        });
      }
      await generate({
        isFirstTime: true,
      });

      // build
      // TODO: support watch mode
      const opts = {
        config: api.config,
        cwd: api.cwd,
        entry: {
          umi: join(api.paths.absTmpPath, 'umi.ts'),
        },
        onBuildComplete(opts: { stats: any }) {
          opts;
        },
        clean: api.args.clean,
      };
      if (api.args.vite) {
        await bundlerVite.build(opts);
      } else {
        await bundlerWebpack.build(opts);
      }

      // generate html

      // print size
    },
  });
};
