import { resolve } from 'path';
import dev from '../dev';

// 修复 Ctrl+C 时 dev server 没有正常退出的问题
process.on('SIGINT', () => {
  process.exit(1);
});

dev();
