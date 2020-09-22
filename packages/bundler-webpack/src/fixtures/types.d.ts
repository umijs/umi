
import * as webpack from 'webpack';

export interface IExpectOpts {
  files: string[];
  indexJS: string;
  indexCSS: string;
  cwd: string;
  ignored: webpack.Options.WatchOptions['ignored']
}
