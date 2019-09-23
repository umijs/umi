export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  browserFiles: [
    'src/findRoute.js',
    'src/plugins/404/NotFound.js',
    'src/plugins/404/guessJSFileFromPath.js',
    'src/plugins/commands/dev/injectUI.js',
    'src/plugins/commands/block/ui/index.tsx',
    'src/plugins/commands/block/ui/ui/index.tsx',
    'src/plugins/commands/block/ui/ui/BlockList/index.tsx',
    'src/plugins/commands/block/ui/ui/BlockList/HighlightedText.tsx',
    'src/plugins/commands/block/ui/flagBabelPlugin/GUmiUIFlag.tsx',
  ],
};
