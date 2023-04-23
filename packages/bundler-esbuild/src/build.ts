import {
  build as buildWithESBuild,
  Format,
  Plugin,
  BuildOptions,
} from '@umijs/bundler-utils/compiled/esbuild';
import { rimraf, winPath } from '@umijs/utils';
import { join } from 'path';
import alias from './plugins/alias';
import externals from './plugins/externals';
import less from './plugins/less';
import { style } from './plugins/style';
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
  inlineStyle?: boolean;
}

export async function build(opts: IOpts) {
  const outputPath = opts.config.outputPath || join(opts.cwd, 'dist');
  if (opts.clean) {
    rimraf.sync(outputPath);
  }
  const config: BuildOptions = {
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
        alias: opts.config.alias,
        // ref: https://github.com/umijs/umi-next/pull/214
        inlineStyle: opts.inlineStyle,
        config: opts.config,
        ...opts.config.lessLoader,
      }),
      opts.config.alias && alias(addCwdPrefix(opts.config.alias, opts.cwd)),
      opts.config.externals && externals(opts.config.externals),
      style({
        inlineStyle: opts.inlineStyle,
        config: opts.config,
      }),
    ].filter(Boolean) as Plugin[],
    define: {
      // __dirname sham
      __dirname: JSON.stringify('__dirname'),
      'process.env.NODE_ENV': JSON.stringify(opts.mode || 'development'),
      ...opts.config.define,
    },
    loader: {
      '.svg': 'dataurl',
      '.ttf': 'dataurl',
      '.wasm': 'dataurl',
      ...opts.config.loader,
    },
  };
  await opts.config.modifyConfig?.(config);
  const result = await buildWithESBuild(config);
  return result;
}

// TODO: move to api.describe({ config: { format } })
function addCwdPrefix(obj: Record<string, string>, cwd: string) {
  Object.keys(obj).forEach((key) => {
    if (obj[key].startsWith('.')) {
      obj[key] = winPath(join(cwd, obj[key]));
    }
  });
  return obj;
}
