module.exports = {
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          components: './components',
        },
      },
    ],
  ],
};
