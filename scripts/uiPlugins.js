const uiPlugins = [
  'packages/umi-plugin-ui/src/plugins/dashboard',
  'packages/umi-plugin-ui/src/plugins/configuration',
  'packages/umi-ui-tasks/src',
  'packages/umi-build-dev/src/plugins/commands/block/ui',
  'packages/umi-plugin-react/ui',
  'packages/umi-ui/ui',
];

const uiDist = [
  'packages/umi-plugin-ui/src/plugins/dashboard/dist/ui.umd.js',
  'packages/umi-plugin-ui/src/plugins/configuration/dist/ui.umd.js',
  'packages/umi-ui-tasks/src/dist/ui.umd.js',
  'packages/umi-build-dev/src/plugins/commands/block/ui/dist/client.umd.js',
  'packages/umi-plugin-react/ui/dist/index.umd.js',
  'packages/umi-ui/ui/dist/ui.umd.js',
  'packages/umi-ui/client/dist/index.html',
];

exports.uiPlugins = uiPlugins;
exports.uiDist = uiDist;
