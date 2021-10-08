"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cssnanoMinify = cssnanoMinify;
exports.cssoMinify = cssoMinify;
exports.cleanCssMinify = cleanCssMinify;
exports.esbuildMinify = esbuildMinify;

/* istanbul ignore next */
async function cssnanoMinify(input, inputSourceMap, minimizerOptions = {
  preset: "default"
}) {
  const load = async module => {
    let exports;

    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      exports = require(module);
      return exports;
    } catch (requireError) {
      let importESM;

      try {
        // eslint-disable-next-line no-new-func
        importESM = new Function("id", "return import(id);");
      } catch (e) {
        importESM = null;
      }

      if (requireError.code === "ERR_REQUIRE_ESM" && importESM) {
        exports = await importESM(module);
        return exports.default;
      }

      throw requireError;
    }
  };

  const [[name, code]] = Object.entries(input);
  const postcssOptions = {
    to: name,
    from: name,
    ...minimizerOptions.processorOptions
  };

  if (typeof postcssOptions.parser === "string") {
    try {
      postcssOptions.parser = await load(postcssOptions.parser);
    } catch (error) {
      throw new Error(`Loading PostCSS "${postcssOptions.parser}" parser failed: ${error.message}\n\n(@${name})`);
    }
  }

  if (typeof postcssOptions.stringifier === "string") {
    try {
      postcssOptions.stringifier = await load(postcssOptions.stringifier);
    } catch (error) {
      throw new Error(`Loading PostCSS "${postcssOptions.stringifier}" stringifier failed: ${error.message}\n\n(@${name})`);
    }
  }

  if (typeof postcssOptions.syntax === "string") {
    try {
      postcssOptions.syntax = await load(postcssOptions.syntax);
    } catch (error) {
      throw new Error(`Loading PostCSS "${postcssOptions.syntax}" syntax failed: ${error.message}\n\n(@${name})`);
    }
  }

  if (inputSourceMap) {
    postcssOptions.map = {
      annotation: false
    };
  } // eslint-disable-next-line global-require


  const postcss = require('postcss'); // eslint-disable-next-line global-require


  const cssnano = require('@umijs/bundler-webpack/compiled/cssnano');

  const result = await postcss([cssnano(minimizerOptions)]).process(code, postcssOptions);
  return {
    code: result.css,
    map: result.map && result.map.toString(),
    warnings: result.warnings().map(String)
  };
}
/* istanbul ignore next */


async function cssoMinify(input, inputSourceMap, minimizerOptions) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const csso = require("csso");

  const [[filename, code]] = Object.entries(input);
  const result = csso.minify(code, {
    filename,
    sourceMap: Boolean(inputSourceMap),
    ...minimizerOptions
  });
  return {
    code: result.css,
    map: result.map && result.map.toJSON()
  };
}
/* istanbul ignore next */


async function cleanCssMinify(input, inputSourceMap, minimizerOptions) {
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const CleanCSS = require("clean-css");

  const [[name, code]] = Object.entries(input);
  const result = await new CleanCSS({
    sourceMap: Boolean(inputSourceMap),
    ...minimizerOptions
  }).minify({
    [name]: {
      styles: code
    }
  });
  return {
    code: result.styles,
    map: result.sourceMap && result.sourceMap.toJSON(),
    warnings: result.warnings
  };
}
/* istanbul ignore next */


async function esbuildMinify(input, sourceMap, minimizerOptions) {
  const buildEsbuildOptions = (esbuildOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      loader: "css",
      minify: true,
      legalComments: "inline",
      ...esbuildOptions,
      sourcemap: false
    };
  }; // eslint-disable-next-line import/no-extraneous-dependencies, global-require


  const esbuild = require('@umijs/bundler-utils/compiled/esbuild'); // Copy `esbuild` options


  const esbuildOptions = buildEsbuildOptions(minimizerOptions); // Let `esbuild` generate a SourceMap

  if (sourceMap) {
    esbuildOptions.sourcemap = true;
    esbuildOptions.sourcesContent = false;
  }

  const [[filename, code]] = Object.entries(input);
  esbuildOptions.sourcefile = filename;
  const result = await esbuild.transform(code, esbuildOptions);
  return {
    code: result.code,
    // eslint-disable-next-line no-undefined
    map: result.map ? result.map : undefined,
    warnings: result.warnings ? result.warnings.map(item => item.toString()) : []
  };
}