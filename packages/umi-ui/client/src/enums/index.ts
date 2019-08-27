export enum THEME {
  'dark' = 'dark',
  'light' = 'light',
}

export enum LOCALES {
  'zh-CN' = '中文',
  'en-US' = 'English',
}

export enum DINGTALK_MEMBERS {
  '云谦' = 'dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=mlc11tv',
  '啸生' = 'dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=ikobe621',
  '宜鑫' = 'dingtalk://dingtalkclient/action/sendmsg?dingtalk_id=ycjcl868',
}

export type ILocale = keyof typeof LOCALES;

export enum LOCALES_ICON {
  'zh-CN' = '🇨🇳',
  'en-US' = '🇳🇿',
}

export enum SPEEDUP_CLIENTS {
  'npm' = 'npm',
  'yarn' = 'yarn',
}

export enum PROJECT_STATUS {
  /** 项目列表 */
  list = 'list',
  /** 导入项目 */
  import = 'import',
  /** 创建项目 */
  create = 'create',
  /** 步骤进度 */
  progress = 'progress',
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
  'code splitting' = 'dynamicImport',
  dll = 'dll',
  internationalization = 'locale',
}

export interface ICreateProgress {
  step: number;
  stepStatus: number;
  steps: string[];
  success?: boolean;
  failure?: Error;
}

export interface IProjectItem {
  name: string;
  path: string;
  creatingProgress?: ICreateProgress;
}

export interface IProjectList {
  currentProject: string;
  projectsByKey: {
    [key: string]: IProjectItem;
  };
}
