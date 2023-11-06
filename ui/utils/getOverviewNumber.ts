import { innerPluginList } from '@/contants';
import { IAppData } from '@/hooks/useAppData';

export const getOverviewNumber = (data: IAppData) => {
  const {
    routes,
    prepare: {
      buildResult: { metafile },
    },
    plugins,
  } = data;

  const inputs = metafile!.inputs;

  // plugins
  const pluginKeys = Object.keys(plugins);
  const pluginsNumber = pluginKeys.filter((k) => {
    return innerPluginList.every((str) => !k.startsWith(str));
  }).length;

  // routes
  const routesKeys = Object.keys(routes);
  const routesNumber = routesKeys.filter((k) => {
    return !routes[k].isLayout;
  }).length;

  // imports
  const exclude: RegExp[] = [/node_modules/];
  const isExclude = (path: string) => {
    return exclude.some((reg) => reg.test(path));
  };
  const list = Object.keys(inputs).reduce((acc, key) => {
    const imports = inputs[key].imports || [];
    const paths = imports
      .map((ipt) => ipt.path)
      .filter((path) => !isExclude(path));
    return [...acc, ...paths];
  }, [] as string[]);
  const importsNumber = new Set(list).size;

  return [routesNumber, pluginsNumber, importsNumber];
};
