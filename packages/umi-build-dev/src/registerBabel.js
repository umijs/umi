import registerBabel from 'af-webpack/registerBabel';
import { CONFIG_FILES } from './constants';

export default function(babelPreset, opts) {
  const { configOnly, disablePreventTest, ignore } = opts;
  const only = configOnly
    ? [new RegExp(`(${CONFIG_FILES.concat('webpack.config.js').join('|')})`)]
    : null;

  registerBabel({
    only,
    ignore,
    babelPreset: [babelPreset, { disableTransform: true }],
    disablePreventTest,
  });
}
