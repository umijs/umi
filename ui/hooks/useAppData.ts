import type { BuildResult } from '@umijs/bundler-utils/compiled/esbuild';
import { useQuery } from 'umi';

interface IRoute {
  path: string;
  id: string;
  parentId?: string;
  file: string;
  absPath: string;
  isLayout?: boolean;
  __content?: string;
  __absFile?: string;
  __isJSFile?: boolean;
}

export interface IPlugin {
  config: Record<string, any>;
  cwd: string;
  enableBy: string;
  id: string;
  key: string;
  path: string;
  time: {
    register: number;
    hooks: Record<string, number[]>;
  };
  type: string;
}

export interface IAppData {
  cwd: string;
  pkg: {
    [key: string]: any;
  };
  pkgPath: string;
  plugins: {
    [key: string]: IPlugin;
  };
  presets: any[];
  name: string;
  args: {
    _: string[];
    [key: string]: boolean | string | string[];
  };
  userConfig: {
    [key: string]: any;
  };
  mainConfigFile: string;
  config: {
    [key: string]: any;
  };
  defaultConfig: {
    [key: string]: any;
  };
  routes: {
    [key: string]: IRoute;
  };
  apiRoutes: {
    // TODO: type
    [key: string]: any;
  };
  hasSrcDir: boolean;
  npmClient: 'npm' | 'yarn' | 'pnpm' | 'cnpm' | 'tnpm';
  umi: {
    version: string;
    name: string;
    importSource: string;
    cliName: string;
  };
  bundleStatus: {
    done: boolean;
    progresses: {
      percent: number;
      status: string;
      // TODO: type
      details: any[];
    }[];
  };
  react: {
    version: string;
    path: string;
  };
  'react-dom': {
    version: string;
    path: string;
  };
  appJS: {
    path: string;
    exports: string[];
  };
  locale: string;
  globalCSS: string[];
  globalJS: string[];
  overridesCSS: string[];
  git: {
    originUrl: string;
  };
  framework: 'react' | 'vue';
  faviconFiles: string[];
  port: number;
  host: string;
  ip: string;
  prepare: {
    buildResult: BuildResult;
  };
}

export function useAppData() {
  return useQuery<IAppData>(['appData'], {
    queryFn() {
      return fetch('/__umi/api/app-data').then((res) => res.json());
    },
  });
}
