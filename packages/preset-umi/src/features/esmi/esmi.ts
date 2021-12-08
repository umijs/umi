import { parse as parseImports } from '@umijs/bundler-utils/compiled/es-module-lexer';
import MagicString from 'magic-string';
import { join } from 'path';
import type { Plugin, ResolvedConfig } from 'vite';
import { createResolver, scan } from '../../libs/scan';
import type { IApi } from '../../types';
import Service, { IImportmapData, IPkgData } from './Service';

let importmap: IImportmapData['importMap'] = { imports: {}, scopes: {} };

/**
 * esmi vite plugin
 */
function esmi(opts: { handleHotUpdate?: Plugin['handleHotUpdate'] }): Plugin {
  return {
    name: 'preset-umi:esmi',

    configResolved(config: ResolvedConfig) {
      const { include, exclude } = config.optimizeDeps;

      // do not pre-compile deps which will be loaded by importmap (for top-level deps)
      if (include?.length) {
        config.optimizeDeps.include = include!.filter(
          (item) => !importmap.imports[item],
        );
      }

      // exclude pre-compile deps which within importmap by default (for nested deps)
      config.optimizeDeps.exclude = (exclude || []).concat(
        Object.keys(importmap.imports).filter((item) =>
          exclude?.includes(item),
        ),
      );
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
          if (specifier && importmap.imports[specifier]) {
            s ??= new MagicString(source);
            s.overwrite(start, end, importmap.imports[specifier]);
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
          deps: Object.entries(api.appData.deps!).map(([name, version]) => ({
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
    api.appData.deps = await scan({
      entry: join(api.paths.absTmpPath, 'umi.ts'),
      externals: api.config.externals,
      resolver,
    });

    // skip umi by default
    delete api.appData.deps['umi'];

    const data = generatePkgData(api);
    const deps = data.pkgInfo.exports.reduce(
      (r, exp) => r.concat(exp.deps.map((dep) => dep.name)),
      [] as string[],
    );
    const hasNewDep = deps.some((i) => !importmap.imports[i]);

    // update importmap from esm if there has new import
    if (hasNewDep) {
      // TODO: add local cache and restore
      importmap = (await service.getImportmap(data))?.importMap!;

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
        return Joi.object();
      },
    },
    enableBy: api.EnableBy.config,
  });

  // check bundler type
  api.onStart(() => {
    if (!api.args.vite) {
      throw new Error(`esmi can only be used in vite mode.`);
    }
  });

  // collect all imports after tmp files generated
  api.onBeforeCompiler(async () => {
    if (api.args.vite) {
      // init esmi service
      service = new Service({ cdnOrigin: api.config.esmi.cdnOrigin });

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
    const scp = $('<script type="importmap"></script>');

    scp.html(JSON.stringify(importmap, null, 2));
    $('head > script:eq(0)').before(scp);

    // TODO: polyfill for legacy browser

    return $;
  });

  if (api.args.vite) {
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
        }),
      );

      return memo;
    });
  } else {
    // TODO: webpack implementation
  }
};
