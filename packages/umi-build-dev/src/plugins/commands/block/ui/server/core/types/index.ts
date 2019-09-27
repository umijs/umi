import { ChildProcess } from 'child_process';
import { IApi } from 'umi-types';
import Logger from '../Logger';

export interface IFlowContext {
  terminated: boolean;
  terminatedMsg?: string;
  currentProc?: ChildProcess;
  logger: Logger; // 输出日志
  api: IApi;
  execa: any;
  stages: any; // 存储各个节点的执行结果
  result: any; // 最终执行结果
}

export interface IAddBlockOption {
  // 从命令行传入会有这个
  _?: string[];
  // 区块的名称和安装的地址
  url?: string;
  // 安装区块需要的分支
  branch?: string;

  // 安装的文件地址
  path?: string;
  // 安装的路由地址
  routePath?: string;
  // 包管理器
  npmClient?: string;
  // 测试运行
  dryRun?: boolean;
  // 跳过安装依赖
  skipDependencies?: boolean;
  // 跳过修改路由
  skipModifyRoutes?: boolean;
  // 是不是区块
  page?: boolean;
  // 如果是 layout 会在路由中生成一个 children
  layout?: boolean;
  // npm 源
  registry?: string;
  // 把 ts 转化为 js
  js?: boolean;
  // 删除区块的 i18n 代码
  uni18n?: boolean;
  // 执行环境，默认是 shell ，如果是 auto，发生冲突直接报错
  // 在 ci 与 function 中执行可以设置为 auto
  execution?: 'shell' | 'auto';

  // 传输 log 用
  remoteLog?: (log: string) => void;
}

export interface ICtxTypes {
  repo?: any;
  branch?: any;
  path?: string;
  id?: string;
  routePath?: string;
  isLocal?: boolean;
  sourcePath?: string;
  repoExists?: boolean;
  filePath?: string;
  templateTmpDirPath?: string;
  pkg?: { blockConfig: { [key: string]: any } };

  blocksTempPath?: string;
}
