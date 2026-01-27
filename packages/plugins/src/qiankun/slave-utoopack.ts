import { IApi } from 'umi';

// slave 的核心逻辑是把产物构造成 webpack 的 library 形式
// 方便 qiankun 根据 entry 文件去找到对应的 lifecycle 方法导出
// 在 umi 场景我们构建一下
export default (api: IApi) => {
  api.describe({});
};
