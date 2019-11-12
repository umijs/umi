import { AddBlockParams } from '../../../data';
import { join } from 'path';
import { existsSync } from 'fs';

export default function({ success, payload, api }) {
  const { path: blockPath } = payload as AddBlockParams;
  // 拼接真实的路径，应该是项目的 pages 目录下
  const absPath = api.winPath(join(api.paths.absPagesPath, blockPath));
  success({
    exists: existsSync(absPath),
    success: true,
  });
}
