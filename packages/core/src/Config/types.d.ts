import { IRoute } from '..';
import { BaseIConfig } from '@umijs/types';

type WithFalse<T> = {
  [P in keyof T]?: T[P] | false;
};

export interface BaseIConfig {
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

export type IConfig = WithFalse<BaseIConfig>;
