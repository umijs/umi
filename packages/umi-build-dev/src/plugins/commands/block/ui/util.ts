import { IConfig } from 'umi-types';

export const genRouterToTreeData = (routes: IConfig['routes']) =>
  routes.map(item => ({
    ...item,
    title: item.path,
    value: item.path,
    key: item.path,
    children: genRouterToTreeData(item.routes || []),
  }));
