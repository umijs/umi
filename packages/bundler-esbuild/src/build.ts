import {
  build as buildWithESBuild,
  Format,
  Plugin,
} from '@umijs/bundler-utils/compiled/esbuild';
import { rimraf } from '@umijs/utils';
import { join } from 'path';
import alias from './plugins/alias';
import externals from './plugins/externals';
import less from './plugins/less';
import { IBabelPlugin, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  mode?: string;
  onBuildComplete?: Function;
  clean?: boolean;
  format?: Format;
  sourcemap?: boolean | 'inline' | 'external' | 'both';
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
}

export async function build(opts: IOpts) {
  const outputPath = opts.config.outputPath || join(opts.cwd, 'dist');
  if (opts.clean) {
    rimraf.sync(outputPath);
  }
  return await buildWithESBuild({
    entryPoints: opts.entry,
    bundle: true,
    format: opts.format || 'iife',
    logLevel: 'error',
    // splitting: true,
    sourcemap: opts.sourcemap,
    outdir: outputPath,
    metafile: true,
    plugins: [
      less({
        modifyVars: opts.config.theme,
        javascriptEnabled: true,
        ...opts.config.lessLoader,
      }),
      opts.config.alias && alias(addCwdPrefix(opts.config.alias, opts.cwd)),
      opts.config.externals && externals(opts.config.externals),
    ].filter(Boolean) as Plugin[],
    define: {
      // __dirname sham
      __dirname: JSON.stringify('__dirname'),
      'process.env.NODE_ENV': JSON.stringify(opts.mode || 'development'),
    },
  });
}

// TODO: move to api.describe({ config: { format } })
function addCwdPrefix(obj: Record<string, string>, cwd: string) {
  Object.keys(obj).forEach((key) => {
    if (obj[key].startsWith('.')) {
      obj[key] = join(cwd, obj[key]);
    }
  });
  return obj;
}
