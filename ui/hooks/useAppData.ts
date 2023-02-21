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

interface IAppData {
  cwd: string;
  pkg: {
    [key: string]: any;
  };
  pkgPath: string;
  plugins: any[];
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
}

export function useAppData() {
  return useQuery<IAppData>(['appData'], {
    queryFn() {
      return fetch('/__umi/api/app-data').then((res) => res.json());
    },
  });
}
