export enum LOCALES {
  'zh-CN' = '中文',
  'en-US' = 'English',
}

export enum PROJECT_STATUS {
  /** 项目列表 */
  list = 'list',
  /** 导入项目 */
  import = 'import',
  /** 创建项目 */
  create = 'create',
}

export type IProjectStatus = keyof typeof PROJECT_STATUS;

export enum IDirectoryType {
  'directory' = 'directory',
  'file' = 'file',
}

export type APP_TYPE = 'ant-design-pro' | 'app';

export type APP_LANGUAGE = 'TypeScript' | 'JavaScript';

export enum REACT_FEATURES {
  antd = 'antd',
  dva = 'dva',
}

export interface ICreateProgress {
  step: number;
  stepStatus: number;
  steps: string[];
  success?: boolean;
  failure?: Error;
}
