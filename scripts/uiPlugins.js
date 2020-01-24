const uiPlugins = [
  'packages/umi-build-dev/src/plugins/commands/block/ui',
  'packages/umi-plugin-react/ui',
];

const uiDist = [
  'packages/umi-build-dev/src/plugins/commands/block/ui/dist/client.umd.js',
  'packages/umi-plugin-react/ui/dist/index.umd.js',
];

exports.uiPlugins = uiPlugins;
exports.uiDist = uiDist;
