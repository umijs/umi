module.exports = {
  plugins: [
    [
      'babel-plugin-module-resolver',
      {
        alias: {
          count: './count',
        },
      },
    ],
  ],
};
