import { useQuery } from 'umi';

export interface IRoute {
  name?: string;
  redirect?: string;
  path: string;
  id: string;
  parentId?: string;
  file?: string;
  absPath: string;
  isLayout?: boolean;
}

export interface IPlugin {
  key: string;
  time: {
    register: number;
    hooks: Record<string, number[]>;
  };
}

export interface IImportGraph {
  inputs: Record<string, { imports: { path: string }[] }>;
}

export interface IAppData {
  plugins?: Record<string, IPlugin>;
  userConfig?: Record<string, unknown>;
  config?: Record<string, unknown>;
  routes?: Record<string, IRoute>;
  prepare?: {
    buildResult: { metafile?: IImportGraph };
  };
  ui?: {
    modules: {
      name: string;
      menus?: {
        path: string;
        url: string;
        icon: string;
        name: string;
        renderType?: string; // 可以选择配置 qiankun，默认 iframe
        meta?: any; // 配置乾坤后可以传递的props，比如 yuyanId?
      }[];
    }[];
  };
}

export function useAppData() {
  return useQuery<IAppData>(['appData'], {
    queryFn() {
      return fetch('/__umi/api/app-data').then((res) => res.json());
    },
  });
}
