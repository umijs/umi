module.exports = {
  presets: [
    [
      'es2015',
      {
        loose: true,
        modules: process.env.BABEL_ENV === 'es' ? false : 'commonjs',
      },
    ],
  ],
}
