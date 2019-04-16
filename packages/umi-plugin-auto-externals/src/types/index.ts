// 用户配置参数
export interface IOpts {
  packages: string[] | Boolean;
  urlTemplate?: string;
  checkOnline?: boolean;
}

export interface IExternalData {
  key: string;
  global: any;
  polyfillExclude: string[];
  scripts: string[];
  styles: string[];
}
