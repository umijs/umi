const { minify: terserMinify } = require('terser');

const buildTerserOptions = ({
  ecma,
  parse = {},
  compress = {},
  mangle,
  module,
  output,
  toplevel,
  nameCache,
  ie8,
  /* eslint-disable camelcase */
  keep_classnames,
  keep_fnames,
  /* eslint-enable camelcase */
  safari10,
} = {}) => ({
  parse: { ...parse },
  compress: typeof compress === 'boolean' ? compress : { ...compress },
  // eslint-disable-next-line no-nested-ternary
  mangle:
    mangle == null
      ? true
      : typeof mangle === 'boolean'
      ? mangle
      : { ...mangle },
  output: {
    beautify: false,
    ...output,
  },
  // Ignoring sourceMap from options
  sourceMap: null,
  ecma,
  keep_classnames,
  keep_fnames,
  ie8,
  module,
  nameCache,
  safari10,
  toplevel,
});

function isObject(value) {
  const type = typeof value;

  return value != null && (type === 'object' || type === 'function');
}

const buildComments = (extractComments, terserOptions, extractedComments) => {
  const condition = {};
  const { comments } = terserOptions.output;

  condition.preserve = typeof comments !== 'undefined' ? comments : false;

  if (typeof extractComments === 'boolean' && extractComments) {
    condition.extract = 'some';
  } else if (
    typeof extractComments === 'string' ||
    extractComments instanceof RegExp
  ) {
    condition.extract = extractComments;
  } else if (typeof extractComments === 'function') {
    condition.extract = extractComments;
  } else if (isObject(extractComments)) {
    condition.extract =
      typeof extractComments.condition === 'boolean' &&
      extractComments.condition
        ? 'some'
        : typeof extractComments.condition !== 'undefined'
        ? extractComments.condition
        : 'some';
  } else {
    // No extract
    // Preserve using "commentsOpts" or "some"
    condition.preserve = typeof comments !== 'undefined' ? comments : 'some';
    condition.extract = false;
  }

  // Ensure that both conditions are functions
  ['preserve', 'extract'].forEach((key) => {
    let regexStr;
    let regex;

    switch (typeof condition[key]) {
      case 'boolean':
        condition[key] = condition[key] ? () => true : () => false;

        break;
      case 'function':
        break;
      case 'string':
        if (condition[key] === 'all') {
          condition[key] = () => true;

          break;
        }

        if (condition[key] === 'some') {
          condition[key] = (astNode, comment) => {
            return (
              (comment.type === 'comment2' || comment.type === 'comment1') &&
              /@preserve|@lic|@cc_on|^\**!/i.test(comment.value)
            );
          };

          break;
        }

        regexStr = condition[key];

        condition[key] = (astNode, comment) => {
          return new RegExp(regexStr).test(comment.value);
        };

        break;
      default:
        regex = condition[key];

        condition[key] = (astNode, comment) => regex.test(comment.value);
    }
  });

  // Redefine the comments function to extract and preserve
  // comments according to the two conditions
  return (astNode, comment) => {
    if (condition.extract(astNode, comment)) {
      const commentText =
        comment.type === 'comment2'
          ? `/*${comment.value}*/`
          : `//${comment.value}`;

      // Don't include duplicate comments
      if (!extractedComments.includes(commentText)) {
        extractedComments.push(commentText);
      }
    }

    return condition.preserve(astNode, comment);
  };
};

async function minify(options) {
  const {
    name,
    input,
    inputSourceMap,
    minify: minifyFn,
    minimizerOptions,
  } = options;

  if (minifyFn) {
    return minifyFn({ [name]: input }, inputSourceMap, minimizerOptions);
  }

  // Copy terser options
  const terserOptions = buildTerserOptions(minimizerOptions);

  // Let terser generate a SourceMap
  if (inputSourceMap) {
    terserOptions.sourceMap = { asObject: true };
  }

  const extractedComments = [];
  const { extractComments } = options;

  terserOptions.output.comments = buildComments(
    extractComments,
    terserOptions,
    extractedComments,
  );

  const result = await terserMinify({ [name]: input }, terserOptions);

  return { ...result, extractedComments };
}

function transform(options) {
  // 'use strict' => this === undefined (Clean Scope)
  // Safer for possible security issues, albeit not critical at all here
  // eslint-disable-next-line no-new-func, no-param-reassign
  options = new Function(
    'exports',
    'require',
    'module',
    '__filename',
    '__dirname',
    `'use strict'\nreturn ${options}`,
  )(exports, require, module, __filename, __dirname);

  return minify(options);
}

module.exports.minify = minify;
module.exports.transform = transform;
