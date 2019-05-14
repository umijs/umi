// ref: https://github.com/smooth-code/svgr/blob/master/packages/webpack/src/index.js
import { getOptions } from 'loader-utils';
import { transform as babelTransform } from '@babel/core';
import convert from '@svgr/core';

function svgrLoader(source) {
  const callback = this.async();
  const { babel = true, ...options } = getOptions(this) || {};

  const readSvg = () => {
    return new Promise((resolve, reject) => {
      this.fs.readFile(this.resourcePath, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  };

  const exportMatches = source.toString('utf-8').match(/^module.exports\s*=\s*(.*)/);
  const previousExport = exportMatches ? exportMatches[1] : null;

  const pBabelTransform = async jsCode => {
    return new Promise((resolve, reject) => {
      babelTransform(
        jsCode,
        {
          babelrc: false,
          // Unless having this, babel will merge the config with global 'babel.config.js' which may causes some problems such as using react-hot-loader/babel in babel.config.js
          configFile: false,
          presets: [
            require.resolve('@babel/preset-react'),
            [require.resolve('@babel/preset-env'), { modules: false }],
          ],
          plugins: [require.resolve('@babel/plugin-transform-react-constant-elements')],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result.code);
        },
      );
    });
  };

  const tranformSvg = svg => {
    return convert(svg, options, {
      webpack: { previousExport },
      filePath: this.resourcePath,
    })
      .then(jsCode => (babel ? pBabelTransform(jsCode) : jsCode))
      .then(result => callback(null, result))
      .catch(err => callback(err));
  };

  if (exportMatches) {
    readSvg().then(tranformSvg);
  } else {
    tranformSvg(source);
  }
}

export default svgrLoader;
