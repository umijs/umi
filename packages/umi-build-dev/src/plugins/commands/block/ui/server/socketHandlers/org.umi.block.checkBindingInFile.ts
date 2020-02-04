import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import haveRootBinding from '../../../sdk/haveRootBinding';

export default async ({ success, payload, api, failure }) => {
  const { path: targetPath, name } = payload as {
    path: string;
    name: string;
  };
  // 找到具体的 js
  const absTargetPath = api.winPath(
    join(
      api.paths.absPagesPath,
      api.winPath(targetPath).replace(api.winPath(api.paths.pagesPath), ''),
    ),
  );
  // 有些用户路由下载路径是不在的，这里拦住他们
  if (
    !existsSync(absTargetPath) &&
    // 当前路由为单文件
    !api.findJS(absTargetPath)
  ) {
    failure({
      message: ` ${absTargetPath} 目录不存在!`,
      success: false,
    });
    return;
  }

  const entryPath = api.findJS(absTargetPath, 'index') || api.findJS(absTargetPath, '');
  if (!entryPath) {
    failure({
      message: `未在 ${absTargetPath} 目录下找到 index.(ts|tsx|js|jsx) !`,
      success: false,
    });
    return;
  }
  const exists = await haveRootBinding(readFileSync(entryPath, 'utf-8'), name);

  success({
    exists,
    success: true,
  });
};
