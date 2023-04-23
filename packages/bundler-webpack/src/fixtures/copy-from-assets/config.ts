export default {
  copy: [
    'assets',
    'foo.json',
    {
      from: 'assets',
      to: 'dist/assets'
    },
    {
      from: 'foo.json',
      to: 'dist/foo-copy.json'
    }
  ],
};
