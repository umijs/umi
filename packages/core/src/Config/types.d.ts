import { IRoute } from '..';

export interface IConfig {
  singular?: boolean;
  outputPath?: string;
  publicPath?: string;
  title?: string;
  mountElementId?: string;
  routes?: IRoute[];
  exportStatic?: {
    htmlSuffix?: boolean;
    dynamicRoot?: boolean;
  };
}
