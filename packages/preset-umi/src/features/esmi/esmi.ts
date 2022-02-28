import { parse as parseImports } from '@umijs/bundler-utils/compiled/es-module-lexer';
import MagicString from 'magic-string';
import { join } from 'path';
import type { Plugin, ResolvedConfig } from 'vite';
import { createResolver } from '../../libs/scan';
import type { IApi } from '../../types';
import requireToImport from './esbuildPlugins/requireToImport';
import topLevelExternal from './esbuildPlugins/topLevelExternal';
import Service, { IImportmapData, IPkgData } from './Service';

let importmap: IImportmapData['importMap'] = { imports: {}, scopes: {} };
let importmatches: Record<string, string> = {};

/**
 * esmi vite plugin
 */
function esmi(opts: {
  handleHotUpdate?: Plugin['handleHotUpdate'];
  resolver: ReturnType<typeof createResolver>;
}): Plugin {
  return {
    name: 'preset-umi:esmi',

    configResolved(config: ResolvedConfig) {
      const { include, exclude } = config.optimizeDeps;

      config.optimizeDeps.include ??= [];

      // do not pre-compile deps which will be loaded by importmap (for top-level deps)
      if (include?.length) {
        config.optimizeDeps.include = include!.filter(
          (item) => !importmatches[item] && !importmap.imports[item],
        );
      }

      // exclude pre-compile deps
      config.optimizeDeps.exclude = [
        ...new Set([
          // deps from user config
          ...(exclude || []),
          // deps from local scan
          ...Object.keys(importmatches),
          // deps from esmi analyze result
          ...Object.keys(importmap.imports),
        ]),
      ];

      // apply esbuild plugins
      config.optimizeDeps.esbuildOptions ??= {};
      // @ts-ignore
      config.optimizeDeps.esbuildOptions!.plugins = [
        // transform require call to import
        requireToImport({ exclude: config.optimizeDeps.exclude }),
        // make sure vite only external top-level npm imports, and resolve sub-path npm imports
        topLevelExternal({
          exclude: config.optimizeDeps.exclude,
          resolver: opts.resolver,
        }),
        // @ts-ignore
      ].concat(config.optimizeDeps.esbuildOptions!.plugins || []);
    },

    transform(source) {
      try {
        // parse imports
        const imports = parseImports(source)[0];
        let s: InstanceType<typeof MagicString> | undefined;

        // process all imports
        imports.forEach((item) => {
          const { n: specifier, s: start, e: end } = item;

          // replace npm package to CDN url for matched imports
          if (specifier) {
            const replacement =
              // search from local scan matches first (for alias)
              (importmatches[specifier] &&
                importmap.imports[importmatches[specifier]]) ||
              // search from esmi analyze result
              importmap.imports[specifier];

            if (replacement) {
              s ??= new MagicString(source);
              s.overwrite(start, end, replacement);
            }
          }
        });

        return s?.toString() || source;
      } catch {
        // syntax error or non-javascript files
        return null;
      }
    },

    handleHotUpdate(ctx) {
      return opts.handleHotUpdate!(ctx);
    },
  };
}

/**
 * generate package data
 * @param api   plugin api
 */
function generatePkgData(api: IApi): IPkgData {
  return {
    pkgJsonContent: {
      dependencies: api.pkg.dependencies || {},
      devDependencies: api.pkg.devDependencies || {},
    },
    pkgInfo: {
      name: api.pkg.name as string,
      version: api.pkg.version as string,
      type: 'esm',
      exports: [
        {
          name: 'default',
          path: 'es/index.js',
          from: '',
          deps: Object.entries(api.appData.deps!)
            // only compile entry imports
            .filter(([_, { matches }]) => matches.length)
            // convert to esmi config
            .map(([name, { version }]) => ({
              name,
              version,
              usedMap: {
                [name]: { usedNamespace: true, usedNames: [] },
              },
            })),
        },
      ],
      assets: [],
    },
  };
}

export default (api: IApi) => {
  let service: InstanceType<typeof Service>;
  let resolver: ReturnType<typeof createResolver>;

  /**
   * refresh importmap and save to the top-level variable
   */
  async function refreshImportMap() {
    // scan and module graph
    // TODO: module graph
    await api.applyPlugins({
      key: 'updateAppDataDeps',
      type: api.ApplyPluginsType.event,
    });

    // skip umi by default
    delete api.appData.deps!['umi'];

    const data = generatePkgData(api);
    const deps = data.pkgInfo.exports.reduce(
      (r, exp) => r.concat(exp.deps.map((dep) => dep.name)),
      [] as string[],
    );
    const hasNewDep = deps.some((i) => !importmap.imports[i]);

    // update importmap from esm if there has new import
    if (hasNewDep) {
      importmap = (await service.getImportmap(data))?.importMap!;

      // update matches map to dep name
      importmatches = Object.keys(api.appData.deps!).reduce<
        Record<string, string>
      >((r, dep) => {
        // filter subpath imports
        if (!api.appData.deps![dep].subpaths.length) {
          // map all matches to dep name
          api.appData.deps![dep].matches.forEach((m) => {
            r[m] = dep;
          });
        }

        return r;
      }, {});

      // because we will replaced package name to CDN url in vite plugin
      // so we must append scope rules for the CDN url like the import specifier
      // example:
      //   origin:
      //   { imports: { a: 'aa', b: 'bb', c: 'cc1' }, scopes: { b: { c: 'cc2' } } }
      //   to:
      //   { imports: { a: 'aa', b: 'bb', c: 'cc1' }, scopes: { b: { c: 'cc2' }, 'bb': { c: 'cc2' } } }
      Object.keys(importmap.scopes || {})
        .filter((item) => importmap.imports[item])
        .forEach((item) => {
          importmap.scopes[importmap.imports[item]] = importmap.scopes[item];
        });
    }
  }

  // describe config
  api.describe({
    key: 'esmi',
    config: {
      schema(Joi) {
        return Joi.object({
          cdnOrigin: Joi.string(),
          shimUrl: Joi.string(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  // check bundler type
  api.onStart(() => {
    if (!api.config.vite) {
      throw new Error(`esmi can only be used in vite mode.`);
    }
  });

  // collect all imports after tmp files generated
  api.onBeforeCompiler(async () => {
    if (api.config.vite) {
      // init esmi service
      service = new Service({
        cdnOrigin: api.config.esmi.cdnOrigin,
        cacheDir: join(api.cwd, '.esmi'),
      });

      // init project resolver
      resolver = createResolver({
        alias: api.config.alias,
      });

      // init importmap
      await refreshImportMap();
    }
  });

  // append ipmortmap script for HTML
  api.modifyHTML(($) => {
    const scp = $('<script type="importmap"></script>\n');

    scp.html(JSON.stringify(importmap, null, 2));
    $('head > script:eq(0)').before(scp);

    // append importmap shim script
    if (api.config.esmi.shimUrl) {
      $('body > script:eq(0)').before(
        $(`<script src="${api.config.esmi.shimUrl}"></script>\n`),
      );
    }

    // preload for importmap modules
    Object.values(importmap.imports).forEach((url) => {
      scp.before($(`<link rel="modulepreload" href="${url}" />\n`));
    });

    return $;
  });

  if (api.config.vite) {
    // apply esmi vite plugin
    api.modifyViteConfig((memo) => {
      memo.plugins = (memo.plugins || []).concat(
        esmi({
          handleHotUpdate: async (ctx) => {
            ctx.file;

            // TODO: incremental refresh by ctx.file
            await refreshImportMap();

            // TODO: refresh page when importmap changed
          },
          resolver,
        }),
      );

      return memo;
    });
  } else {
    // TODO: webpack implementation
  }
};
