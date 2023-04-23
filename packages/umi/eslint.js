try {
  require.resolve('@umijs/lint/package.json');
} catch (err) {
  throw new Error('@umijs/lint is not built-in, please install it manually before run umi lint.');
}

module.exports = process.env.LEGACY_ESLINT ? require('@umijs/lint/dist/config/eslint/legacy') : require('@umijs/lint/dist/config/eslint');
