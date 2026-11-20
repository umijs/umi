import type { Metafile } from '@umijs/bundler-utils/compiled/esbuild';
import { isAbsolute, relative, resolve, sep } from 'path';
import type { IApi, IRoute, IUIModule } from '../../types';

export function getDiagnosticConfig(config: Record<string, unknown>) {
  const history = (config.history as { type?: unknown } | undefined)?.type;

  return {
    hash: typeof config.hash === 'boolean' ? config.hash : undefined,
    history:
      history === 'browser' || history === 'hash' || history === 'memory'
        ? { type: history }
        : undefined,
    mfsu: config.mfsu === undefined ? undefined : Boolean(config.mfsu),
    ssr: config.ssr === undefined ? undefined : Boolean(config.ssr),
    vite: config.vite === undefined ? undefined : Boolean(config.vite),
    utoopack:
      config.utoopack === undefined ? undefined : Boolean(config.utoopack),
  };
}

export function getDiagnosticAppData(api: IApi) {
  const data = api.appData;
  // The default DevTool is available on every development server.
  const summary = {
    bundler: typeof data.bundler === 'string' ? data.bundler : undefined,
    framework: typeof data.framework === 'string' ? data.framework : undefined,
    umi: {
      version:
        typeof data.umi?.version === 'string' ? data.umi.version : undefined,
    },
    bundleStatus: { done: Boolean(data.bundleStatus?.done) },
  };

  if (!api.userConfig.ui) {
    return summary;
  }

  const routes: Record<string, IRoute> = data.routes ?? {};
  const plugins: Record<
    string,
    {
      key: string;
      time: { register?: number; hooks: Record<string, number[]> };
    }
  > = data.plugins ?? {};
  const modules: IUIModule[] = data.ui?.modules ?? [];

  return {
    ...summary,
    userConfig: getDiagnosticConfig(api.userConfig),
    config: getDiagnosticConfig(api.config),
    routes: Object.fromEntries(
      Object.entries(routes).map(([id, route]) => [
        id,
        {
          id: route.id,
          parentId: route.parentId,
          name: typeof route.name === 'string' ? route.name : undefined,
          path: route.path,
          absPath: route.absPath,
          redirect: isDiagnosticWebUrl(route.redirect)
            ? route.redirect.split(/[?#]/, 1)[0]
            : undefined,
          isLayout: Boolean(route.isLayout),
          file: projectPath(api.cwd, route.__absFile ?? route.file),
        },
      ]),
    ),
    plugins: Object.fromEntries(
      Object.entries(plugins).map(([id, plugin], index) => [
        isAbsolute(id) ? `local-plugin-${index}` : id,
        {
          key: plugin.key,
          time: {
            register: plugin.time.register ?? 0,
            hooks: Object.fromEntries(
              Object.entries(plugin.time.hooks).map(([name, times]) => [
                name,
                times.filter(Number.isFinite),
              ]),
            ),
          },
        },
      ]),
    ),
    prepare: {
      buildResult: {
        metafile: getImportGraph(api.cwd, data.prepare?.buildResult?.metafile),
      },
    },
    ui: {
      modules: modules.map((module) => ({
        name: module.name,
        menus: module.menus?.flatMap(({ path, name, icon, url }) => {
          return isDiagnosticWebUrl(url) ? [{ path, name, icon, url }] : [];
        }),
      })),
    },
  };
}

function projectPath(cwd: string, file?: string) {
  if (!file) return;

  const fromProject = relative(cwd, resolve(cwd, file));
  if (isAbsolute(fromProject)) return;

  const path = fromProject.split(sep).join('/');
  if (
    path &&
    path !== '..' &&
    !path.startsWith('../') &&
    !/[:?#\\]/.test(path)
  ) {
    return path;
  }
}

function getImportGraph(cwd: string, metafile?: Metafile) {
  if (!metafile) return;

  const inputs = Object.entries(metafile.inputs).flatMap(([file, input]) => {
    const path = projectPath(cwd, file);
    if (!path) return [];

    const imports = input.imports.flatMap((entry) => {
      const path = projectPath(cwd, entry.path);
      return path ? [{ path }] : [];
    });
    return [[path, { imports }] as const];
  });
  return { inputs: Object.fromEntries(inputs) };
}

function isDiagnosticWebUrl(url: unknown): url is string {
  if (typeof url !== 'string' || !url) return false;

  try {
    const target = new URL(url, 'http://localhost');
    return (
      (target.protocol === 'http:' || target.protocol === 'https:') &&
      !target.username &&
      !target.password
    );
  } catch {
    return false;
  }
}
