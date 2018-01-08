import registerBabel from 'af-webpack/registerBabel';
import { CONFIG_FILES } from './constants';

export default function resiterBabelFn(babelPreset, opts) {
  const { only, disablePreventTest, ignore } = opts;
  registerBabel({
    only,
    ignore,
    babelPreset: [babelPreset, { disableTransform: true }],
    disablePreventTest,
  });
}

export function registerBabelForConfig(babelPreset, opts = {}) {
  resiterBabelFn(babelPreset, {
    ...opts,
    only: [
      new RegExp(
        `(${CONFIG_FILES.concat(['webpack.config.js', '.webpackrc.js']).join(
          '|',
        )})`,
      ),
    ],
  });
}
