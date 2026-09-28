import type { IApi } from 'umi';

interface InspectorModules {
  inspector: {
    createDataInspectorDevframe: (options: {
      id: string;
      name: string;
      icon: string;
      exampleSource: boolean;
    }) => any;
  };
  registry: {
    registerDataSource: (entry: {
      id: string;
      title: string;
      description: string;
      icon: string;
      data: () => ReturnType<typeof createUmiSnapshot>;
      queries: { title: string; query: string }[];
    }) => { unregister: () => void; notifyChanged: () => void };
  };
}

let umiSourceHandle:
  | { unregister: () => void; notifyChanged: () => void }
  | undefined;

export function notifyUmiSourceChanged() {
  umiSourceHandle?.notifyChanged();
}

const stringOrNull = (value: unknown): string | null =>
  typeof value === 'string' ? value : null;

const finiteNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

function getProgresses(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((progress) => {
    const percent = finiteNumberOrNull(progress?.percent);
    return {
      percent:
        percent === null
          ? null
          : Math.round(percent <= 1 ? percent * 100 : percent),
      status: stringOrNull(progress?.status),
    };
  });
}

/** Only plain, selected fields reach the query workbench. */
export function createUmiSnapshot(api: IApi) {
  const routeMap = (api.appData.routes || {}) as Record<
    string,
    Record<string, unknown>
  >;
  const routes = Object.entries(routeMap)
    .map(([id, route]) => ({
      id,
      path: stringOrNull(route?.path),
      parentId: stringOrNull(route?.parentId),
      name: stringOrNull(route?.name),
      component: stringOrNull(route?.component),
      redirect: stringOrNull(route?.redirect),
      file: stringOrNull(route?.file),
    }))
    .sort((a, b) => (a.path || a.id).localeCompare(b.path || b.id));

  const plugins = Object.values(api.service.plugins || {})
    .map((plugin) => {
      const hooks = Object.fromEntries(
        Object.entries(plugin.time?.hooks || {}).map(([name, durations]) => [
          name,
          Array.isArray(durations)
            ? durations.reduce<number>(
                (total, duration) =>
                  total + (finiteNumberOrNull(duration) || 0),
                0,
              )
            : 0,
        ]),
      );
      const registerMs = finiteNumberOrNull(plugin.time?.register) || 0;
      const totalMs =
        registerMs +
        Object.values(hooks).reduce<number>((total, ms) => total + ms, 0);
      return {
        id: plugin.id,
        key: plugin.key,
        type: plugin.type,
        enabled: !api.service.skipPluginIds.has(plugin.id),
        registerMs,
        totalMs,
        hooks,
      };
    })
    .sort((a, b) => b.totalMs - a.totalMs);

  const bundleStatus = api.appData.bundleStatus;
  const mfsuBundleStatus = api.appData.mfsuBundleStatus;
  const config = api.config;

  return {
    project: {
      name: stringOrNull(api.pkg.name),
      umiVersion: stringOrNull(api.appData.umi?.version),
      bundler: stringOrNull(api.appData.bundler),
    },
    build: {
      compiledOnce: bundleStatus?.done === true,
      progresses: getProgresses(bundleStatus?.progresses),
      mfsu: {
        enabled: config.mfsu !== false && !api.appData.vite,
        compiledOnce: mfsuBundleStatus?.done === true,
        progresses: getProgresses(mfsuBundleStatus?.progresses),
      },
    },
    config: {
      base: stringOrNull(config.base),
      publicPath: stringOrNull(config.publicPath),
      historyType: stringOrNull(config.history?.type),
      outputPath: stringOrNull(config.outputPath),
      hash: config.hash === true,
      ssr: Boolean(config.ssr),
    },
    routes,
    plugins,
  };
}

export function createUmiDevframe(api: IApi, modules: InspectorModules) {
  umiSourceHandle?.unregister();
  umiSourceHandle = modules.registry.registerDataSource({
    id: 'umi:project',
    title: 'Umi project',
    description:
      'Live routes, plugin timings, build status, and config summary',
    icon: 'i-ph:stack-duotone',
    data: () => createUmiSnapshot(api),
    queries: [
      { title: 'Build status', query: 'build' },
      { title: 'Routes', query: 'routes' },
      { title: 'Plugin timings', query: 'plugins' },
      { title: 'Config summary', query: 'config' },
    ],
  });

  return modules.inspector.createDataInspectorDevframe({
    id: 'umi',
    name: 'Umi DevTools',
    icon: 'ph:stack-duotone',
    exampleSource: false,
  });
}
