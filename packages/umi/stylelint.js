try {
  require.resolve('@umijs/lint/package.json');
} catch (err) {
  throw new Error('@umijs/lint is not built-in, please install it manually before run umi lint.');
}

module.exports = require('@umijs/lint/dist/config/stylelint');
