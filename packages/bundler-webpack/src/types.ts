import { Configuration } from '../compiled/webpack';

export enum Env {
  development = 'development',
  production = 'production',
}

type WebpackConfig = Required<Configuration>;

export interface IConfig {
  alias: Record<string, string>;
  devtool: any;
  externals: WebpackConfig['externals'];
  hash: any;
  outputPath: string;
  publicPath: string;
  [key: string]: any;
}
