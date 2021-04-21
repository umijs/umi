import * as webpack from '@umijs/deps/compiled/webpack';

export interface IExpectOpts {
  files: string[];
  indexJS: string;
  indexCSS: string;
  indexCSSMap: string;
  cwd: string;
  ignored: webpack.Options.WatchOptions['ignored'];
}
