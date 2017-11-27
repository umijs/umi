import { resolve } from 'path';
import dev from 'umi-buildAndDev/lib/dev';

// 修复 Ctrl+C 时 dev server 没有正常退出的问题
process.on('SIGINT', () => {
  process.exit(1);
});

dev({
  babel: resolve(__dirname, '../babel'),
  enableCSSModules: true,
  extraResolveModules: [resolve(__dirname, '../../node_modules')],
});
