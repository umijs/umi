import { isWindows } from '../';

// 暂时无法使用 jest 进行单元测试，原因可参见
// https://github.com/facebook/jest/issues/5741

export default function (cacheKey: string): void {
  // windows 下 require.cache 中路径 key 为类似 ‘c:\demo\.umirc.ts’
  const cachePath = isWindows ? cacheKey.replace(/\//g, '\\') : cacheKey;
  if (require.cache[cachePath]) {
    const cacheParent = (require.cache[cachePath] as any).parent;
    let i = cacheParent?.children.length || 0;
    // 清理 require cache 中 parents 的引用
    while (i--) {
      if (cacheParent!.children[i].id === cachePath) {
        cacheParent!.children.splice(i, 1);
      }
    }

    delete require.cache[cachePath];
  }
}
