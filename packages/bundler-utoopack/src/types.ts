import type { IOpts as IConfigOpts } from '@umijs/bundler-webpack';

export type IOpts = {
  cwd: string;
  rootDir: string;
  entry: Record<string, string>;
  config: Record<string, any>;
  onBuildComplete?: Function;
  babelPreset?: any;
  chainWebpack?: Function;
  modifyWebpackConfig?: Function;
  beforeBabelPlugins?: any[];
  beforeBabelPresets?: any[];
  extraBabelPlugins?: any[];
  extraBabelPresets?: any[];
  clean?: boolean;
  watch?: boolean;
  disableCopy?: boolean;
} & Pick<IConfigOpts, 'cache' | 'pkg'>;
