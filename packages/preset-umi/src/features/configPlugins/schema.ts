// sort-object-keys
import { NpmClientEnum } from '@umijs/utils';
import { z } from '@umijs/utils/compiled/zod';

export function getSchemas(): Record<string, ({}: { zod: typeof z }) => any> {
  const scriptsSchema = ({ zod }: { zod: typeof z }) =>
    zod.array(
      zod.union([
        zod.string(),
        zod.object({
          src: zod.string().optional(),
        }),
        zod.object({
          content: zod.string().optional(),
        }),
        zod.record(zod.string(), zod.any()),
      ]),
    );
  return {
    analyze: ({ zod }) => zod.object({}),
    base: ({ zod }) => zod.string(),
    conventionRoutes: ({ zod }) =>
      zod.object({
        base: zod.string().optional(),
        exclude: zod.array(zod.any()).optional(),
      }),
    esbuildMinifyIIFE: ({ zod }) => zod.boolean(),
    headScripts: scriptsSchema,
    history: ({ zod }) =>
      zod.object({
        type: zod.enum(['browser', 'hash', 'memory']),
      }),
    historyWithQuery: ({ zod }) => zod.object({}),
    links: ({ zod }) =>
      zod.array(
        zod.union([
          zod
            .object({
              crossorigin: zod.string(),
              href: zod.string(),
              hreflang: zod.string(),
              media: zod.string(),
              referrerpolicy: zod.string(),
              rel: zod.string(),
              sizes: zod.any(),
              title: zod.any(),
              type: zod.any(),
            })
            .deepPartial(),
          zod.record(zod.string(), zod.any()),
        ]),
      ),
    metas: ({ zod }) =>
      zod.array(
        zod.union([
          zod
            .object({
              charset: zod.string(),
              content: zod.string(),
              'http-equiv': zod.string(),
              name: zod.string(),
            })
            .deepPartial(),
          zod.record(zod.string(), zod.any()),
        ]),
      ),
    mountElementId: ({ zod }) => zod.string(),
    npmClient: ({ zod }) =>
      zod.enum([
        NpmClientEnum.pnpm,
        NpmClientEnum.tnpm,
        NpmClientEnum.cnpm,
        NpmClientEnum.yarn,
        NpmClientEnum.npm,
      ]),
    plugins: ({ zod }) => zod.array(zod.string()),
    presets: ({ zod }) => zod.array(zod.string()),
    publicPath: ({ zod }) =>
      zod.string().regex(/(\/|^auto)$/, {
        message: 'publicPath must be "auto" or end with /',
      }),
    reactRouter5Compat: ({ zod }) => zod.union([zod.boolean(), zod.object({})]),
    routes: ({ zod }) => {
      const routeSchema: any = zod.union([
        zod
          .object({
            component: zod.string(),
            layout: zod.literal(false),
            path: zod.string(),
            redirect: zod.string(),
            // lazy schema need replace type when `zod2ts`
            routes: zod.lazy(() => routeSchema.array()),
            wrappers: zod.array(zod.string()),
          })
          .deepPartial(),
        zod.record(zod.string(), zod.any()),
      ]);
      return routeSchema.array();
    },
    scripts: scriptsSchema,
    styles: scriptsSchema,
    title: ({ zod }) => zod.string(),
  };
}
