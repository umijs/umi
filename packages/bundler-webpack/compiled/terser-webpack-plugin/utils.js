"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.terserMinify = terserMinify;
exports.uglifyJsMinify = uglifyJsMinify;
exports.swcMinify = swcMinify;
exports.esbuildMinify = esbuildMinify;

/** @typedef {import("source-map").RawSourceMap} RawSourceMap */

/** @typedef {import("terser").FormatOptions} TerserFormatOptions */

/** @typedef {import("terser").MinifyOptions} TerserOptions */

/** @typedef {import("uglify-js").OutputOptions} UglifyJSOutputOptions */

/** @typedef {import("uglify-js").MinifyOptions} UglifyJSOptions */

/** @typedef {import("@swc/core").JsMinifyOptions} SwcOptions */

/** @typedef {import("esbuild").TransformOptions} EsbuildOptions */

/** @typedef {import("./index.js").ExtractCommentsOptions} ExtractCommentsOptions */

/** @typedef {import("./index.js").ExtractCommentsFunction} ExtractCommentsFunction */

/** @typedef {import("./index.js").ExtractCommentsCondition} ExtractCommentsCondition */

/** @typedef {import("./index.js").Input} Input */

/** @typedef {import("./index.js").MinimizedResult} MinimizedResult */

/** @typedef {import("./index.js").PredefinedOptions} PredefinedOptions */

/**
 * @typedef {TerserOptions & { sourceMap: undefined } & ({ output: TerserFormatOptions & { beautify: boolean } } | { format: TerserFormatOptions & { beautify: boolean } })} NormalizedTerserOptions
 */

/**
 * @typedef {UglifyJSOptions & { sourceMap: undefined } & { output: UglifyJSOutputOptions & { beautify: boolean } }} NormalizedUglifyJSOptions
 */

/**
 * @typedef {SwcOptions & { sourceMap: undefined }} NormalizedSwcOptions
 */

/**
 * @typedef {Array<string>} ExtractedComments
 */

/* istanbul ignore next */

/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & TerserOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */
async function terserMinify(input, sourceMap, minimizerOptions, extractComments) {
  /**
   * @param {any} value
   * @returns {boolean}
   */
  const isObject = value => {
    const type = typeof value;
    return value != null && (type === "object" || type === "function");
  };
  /**
   * @param {NormalizedTerserOptions} terserOptions
   * @param {ExtractedComments} extractedComments
   * @returns {ExtractCommentsFunction}
   */


  const buildComments = (terserOptions, extractedComments) => {
    /** @type {{ [index: string]: ExtractCommentsCondition }} */
    const condition = {};
    let comments;

    if (terserOptions.format) {
      ({
        comments
      } = terserOptions.format);
    } else if (terserOptions.output) {
      ({
        comments
      } = terserOptions.output);
    }

    condition.preserve = typeof comments !== "undefined" ? comments : false;

    if (typeof extractComments === "boolean" && extractComments) {
      condition.extract = "some";
    } else if (typeof extractComments === "string" || extractComments instanceof RegExp) {
      condition.extract = extractComments;
    } else if (typeof extractComments === "function") {
      condition.extract = extractComments;
    } else if (extractComments && isObject(extractComments)) {
      condition.extract = typeof extractComments.condition === "boolean" && extractComments.condition ? "some" : typeof extractComments.condition !== "undefined" ? extractComments.condition : "some";
    } else {
      // No extract
      // Preserve using "commentsOpts" or "some"
      condition.preserve = typeof comments !== "undefined" ? comments : "some";
      condition.extract = false;
    } // Ensure that both conditions are functions


    ["preserve", "extract"].forEach(key => {
      /** @type {undefined | string} */
      let regexStr;
      /** @type {undefined | RegExp} */

      let regex;

      switch (typeof condition[key]) {
        case "boolean":
          condition[key] = condition[key] ? () => true : () => false;
          break;

        case "function":
          break;

        case "string":
          if (condition[key] === "all") {
            condition[key] = () => true;

            break;
          }

          if (condition[key] === "some") {
            condition[key] = (astNode, comment) => (comment.type === "comment2" || comment.type === "comment1") && /@preserve|@lic|@cc_on|^\**!/i.test(comment.value);

            break;
          }

          regexStr = condition[key];

          condition[key] = (astNode, comment) => new RegExp(regexStr).test(comment.value);

          break;

        default:
          regex = condition[key];

          condition[key] = (astNode, comment) =>
          /** @type {RegExp} */
          regex.test(comment.value);

      }
    }); // Redefine the comments function to extract and preserve
    // comments according to the two conditions

    return (astNode, comment) => {
      if (
      /** @type {{ extract: ExtractCommentsFunction }} */
      condition.extract(astNode, comment)) {
        const commentText = comment.type === "comment2" ? `/*${comment.value}*/` : `//${comment.value}`; // Don't include duplicate comments

        if (!extractedComments.includes(commentText)) {
          extractedComments.push(commentText);
        }
      }

      return (
        /** @type {{ preserve: ExtractCommentsFunction }} */
        condition.preserve(astNode, comment)
      );
    };
  };
  /**
   * @param {TerserOptions} [terserOptions={}]
   * @returns {NormalizedTerserOptions}
   */


  const buildTerserOptions = (terserOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return { ...terserOptions,
      compress: typeof terserOptions.compress === "boolean" ? terserOptions.compress : { ...terserOptions.compress
      },
      // ecma: terserOptions.ecma,
      // ie8: terserOptions.ie8,
      // keep_classnames: terserOptions.keep_classnames,
      // keep_fnames: terserOptions.keep_fnames,
      mangle: terserOptions.mangle == null ? true : typeof terserOptions.mangle === "boolean" ? terserOptions.mangle : { ...terserOptions.mangle
      },
      // module: terserOptions.module,
      // nameCache: { ...terserOptions.toplevel },
      // the `output` option is deprecated
      ...(terserOptions.format ? {
        format: {
          beautify: false,
          ...terserOptions.format
        }
      } : {
        output: {
          beautify: false,
          ...terserOptions.output
        }
      }),
      parse: { ...terserOptions.parse
      },
      // safari10: terserOptions.safari10,
      // Ignoring sourceMap from options
      // eslint-disable-next-line no-undefined
      sourceMap: undefined // toplevel: terserOptions.toplevel

    };
  }; // eslint-disable-next-line global-require


  const {
    minify
  } = require('@umijs/bundler-webpack/compiled/terser'); // Copy `terser` options


  const terserOptions = buildTerserOptions(minimizerOptions); // Let terser generate a SourceMap

  if (sourceMap) {
    // @ts-ignore
    terserOptions.sourceMap = {
      asObject: true
    };
  }
  /** @type {ExtractedComments} */


  const extractedComments = [];

  if (terserOptions.output) {
    terserOptions.output.comments = buildComments(terserOptions, extractedComments);
  } else if (terserOptions.format) {
    terserOptions.format.comments = buildComments(terserOptions, extractedComments);
  }

  const [[filename, code]] = Object.entries(input);
  const result = await minify({
    [filename]: code
  }, terserOptions);
  return {
    code: result.code,
    // @ts-ignore
    // eslint-disable-next-line no-undefined
    map: result.map ? result.map : undefined,
    extractedComments
  };
}
/**
 * @returns {string | undefined}
 */


terserMinify.getMinimizerVersion = () => {
  let packageJson;

  try {
    // eslint-disable-next-line global-require
    packageJson = require('@umijs/bundler-webpack/compiled/terser/package.json');
  } catch (error) {// Ignore
  }

  return packageJson && packageJson.version;
};
/* istanbul ignore next */

/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & UglifyJSOptions} minimizerOptions
 * @param {ExtractCommentsOptions | undefined} extractComments
 * @return {Promise<MinimizedResult>}
 */


async function uglifyJsMinify(input, sourceMap, minimizerOptions, extractComments) {
  /**
   * @param {any} value
   * @returns {boolean}
   */
  const isObject = value => {
    const type = typeof value;
    return value != null && (type === "object" || type === "function");
  };
  /**
   * @param {NormalizedUglifyJSOptions} uglifyJsOptions
   * @param {ExtractedComments} extractedComments
   * @returns {ExtractCommentsFunction}
   */


  const buildComments = (uglifyJsOptions, extractedComments) => {
    /** @type {{ [index: string]: ExtractCommentsCondition }} */
    const condition = {};
    const {
      comments
    } = uglifyJsOptions.output;
    condition.preserve = typeof comments !== "undefined" ? comments : false;

    if (typeof extractComments === "boolean" && extractComments) {
      condition.extract = "some";
    } else if (typeof extractComments === "string" || extractComments instanceof RegExp) {
      condition.extract = extractComments;
    } else if (typeof extractComments === "function") {
      condition.extract = extractComments;
    } else if (extractComments && isObject(extractComments)) {
      condition.extract = typeof extractComments.condition === "boolean" && extractComments.condition ? "some" : typeof extractComments.condition !== "undefined" ? extractComments.condition : "some";
    } else {
      // No extract
      // Preserve using "commentsOpts" or "some"
      condition.preserve = typeof comments !== "undefined" ? comments : "some";
      condition.extract = false;
    } // Ensure that both conditions are functions


    ["preserve", "extract"].forEach(key => {
      /** @type {undefined | string} */
      let regexStr;
      /** @type {undefined | RegExp} */

      let regex;

      switch (typeof condition[key]) {
        case "boolean":
          condition[key] = condition[key] ? () => true : () => false;
          break;

        case "function":
          break;

        case "string":
          if (condition[key] === "all") {
            condition[key] = () => true;

            break;
          }

          if (condition[key] === "some") {
            condition[key] = (astNode, comment) => (comment.type === "comment2" || comment.type === "comment1") && /@preserve|@lic|@cc_on|^\**!/i.test(comment.value);

            break;
          }

          regexStr = condition[key];

          condition[key] = (astNode, comment) => new RegExp(regexStr).test(comment.value);

          break;

        default:
          regex = condition[key];

          condition[key] = (astNode, comment) =>
          /** @type {RegExp} */
          regex.test(comment.value);

      }
    }); // Redefine the comments function to extract and preserve
    // comments according to the two conditions

    return (astNode, comment) => {
      if (
      /** @type {{ extract: ExtractCommentsFunction }} */
      condition.extract(astNode, comment)) {
        const commentText = comment.type === "comment2" ? `/*${comment.value}*/` : `//${comment.value}`; // Don't include duplicate comments

        if (!extractedComments.includes(commentText)) {
          extractedComments.push(commentText);
        }
      }

      return (
        /** @type {{ preserve: ExtractCommentsFunction }} */
        condition.preserve(astNode, comment)
      );
    };
  };
  /**
   * @param {UglifyJSOptions} [uglifyJsOptions={}]
   * @returns {NormalizedUglifyJSOptions}
   */


  const buildUglifyJsOptions = (uglifyJsOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return { ...uglifyJsOptions,
      // warnings: uglifyJsOptions.warnings,
      parse: { ...uglifyJsOptions.parse
      },
      compress: typeof uglifyJsOptions.compress === "boolean" ? uglifyJsOptions.compress : { ...uglifyJsOptions.compress
      },
      mangle: uglifyJsOptions.mangle == null ? true : typeof uglifyJsOptions.mangle === "boolean" ? uglifyJsOptions.mangle : { ...uglifyJsOptions.mangle
      },
      output: {
        beautify: false,
        ...uglifyJsOptions.output
      },
      // Ignoring sourceMap from options
      // eslint-disable-next-line no-undefined
      sourceMap: undefined // toplevel: uglifyJsOptions.toplevel
      // nameCache: { ...uglifyJsOptions.toplevel },
      // ie8: uglifyJsOptions.ie8,
      // keep_fnames: uglifyJsOptions.keep_fnames,

    };
  }; // eslint-disable-next-line global-require, import/no-extraneous-dependencies


  const {
    minify
  } = require('uglify-js'); // eslint-disable-next-line no-param-reassign


  delete minimizerOptions.ecma; // eslint-disable-next-line no-param-reassign

  delete minimizerOptions.module; // Copy `uglify-js` options

  const uglifyJsOptions = buildUglifyJsOptions(minimizerOptions); // Let terser generate a SourceMap

  if (sourceMap) {
    // @ts-ignore
    uglifyJsOptions.sourceMap = true;
  }
  /** @type {ExtractedComments} */


  const extractedComments = []; // @ts-ignore

  uglifyJsOptions.output.comments = buildComments(uglifyJsOptions, extractedComments);
  const [[filename, code]] = Object.entries(input);
  const result = await minify({
    [filename]: code
  }, uglifyJsOptions);
  return {
    code: result.code,
    // eslint-disable-next-line no-undefined
    map: result.map ? JSON.parse(result.map) : undefined,
    errors: result.error ? [result.error] : [],
    warnings: result.warnings || [],
    extractedComments
  };
}
/**
 * @returns {string | undefined}
 */


uglifyJsMinify.getMinimizerVersion = () => {
  let packageJson;

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    packageJson = require('uglify-js/package.json');
  } catch (error) {// Ignore
  }

  return packageJson && packageJson.version;
};
/* istanbul ignore next */

/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & SwcOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */


async function swcMinify(input, sourceMap, minimizerOptions) {
  /**
   * @param {SwcOptions} [swcOptions={}]
   * @returns {NormalizedSwcOptions}
   */
  const buildSwcOptions = (swcOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return { ...swcOptions,
      compress: typeof swcOptions.compress === "boolean" ? swcOptions.compress : { ...swcOptions.compress
      },
      mangle: swcOptions.mangle == null ? true : typeof swcOptions.mangle === "boolean" ? swcOptions.mangle : { ...swcOptions.mangle
      },
      // ecma: swcOptions.ecma,
      // keep_classnames: swcOptions.keep_classnames,
      // keep_fnames: swcOptions.keep_fnames,
      // module: swcOptions.module,
      // safari10: swcOptions.safari10,
      // toplevel: swcOptions.toplevel
      // eslint-disable-next-line no-undefined
      sourceMap: undefined
    };
  }; // eslint-disable-next-line import/no-extraneous-dependencies, global-require


  const swc = require('@swc/core'); // Copy `swc` options


  const swcOptions = buildSwcOptions(minimizerOptions); // Let `swc` generate a SourceMap

  if (sourceMap) {
    // @ts-ignore
    swcOptions.sourceMap = true;
  }

  const [[filename, code]] = Object.entries(input);
  const result = await swc.minify(code, swcOptions);
  let map;

  if (result.map) {
    map = JSON.parse(result.map); // TODO workaround for swc because `filename` is not preset as in `swc` signature as for `terser`

    map.sources = [filename];
    delete map.sourcesContent;
  }

  return {
    code: result.code,
    map
  };
}
/**
 * @returns {string | undefined}
 */


swcMinify.getMinimizerVersion = () => {
  let packageJson;

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    packageJson = require('@swc/core/package.json');
  } catch (error) {// Ignore
  }

  return packageJson && packageJson.version;
};
/* istanbul ignore next */

/**
 * @param {Input} input
 * @param {RawSourceMap | undefined} sourceMap
 * @param {PredefinedOptions & EsbuildOptions} minimizerOptions
 * @return {Promise<MinimizedResult>}
 */


async function esbuildMinify(input, sourceMap, minimizerOptions) {
  /**
   * @param {EsbuildOptions} [esbuildOptions={}]
   * @returns {EsbuildOptions}
   */
  const buildEsbuildOptions = (esbuildOptions = {}) => {
    // Need deep copy objects to avoid https://github.com/terser/terser/issues/366
    return {
      minify: true,
      legalComments: "inline",
      ...esbuildOptions,
      sourcemap: false
    };
  }; // eslint-disable-next-line import/no-extraneous-dependencies, global-require


  const esbuild = require('@umijs/bundler-utils/compiled/esbuild'); // eslint-disable-next-line no-param-reassign


  delete minimizerOptions.ecma;

  if (minimizerOptions.module) {
    // eslint-disable-next-line no-param-reassign
    minimizerOptions.format = "esm";
  } // eslint-disable-next-line no-param-reassign


  delete minimizerOptions.module; // Copy `swc` options

  const esbuildOptions = buildEsbuildOptions(minimizerOptions); // Let `swc` generate a SourceMap

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
    map: result.map ? JSON.parse(result.map) : undefined,
    warnings: result.warnings ? result.warnings.map(item => item.toString()) : []
  };
}
/**
 * @returns {string | undefined}
 */


esbuildMinify.getMinimizerVersion = () => {
  let packageJson;

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    packageJson = require('@umijs/bundler-utils/compiled/esbuild/package.json');
  } catch (error) {// Ignore
  }

  return packageJson && packageJson.version;
};