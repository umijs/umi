// sort-object-keys
import { NpmClientEnum } from '@umijs/utils';
import { z } from '@umijs/utils/compiled/zod';

export function getSchemas(): Record<string, ({}: { zod: typeof z }) => any> {
  return {
    analyze: ({ zod }) => zod.object({}),
    base: ({ zod }) => zod.string(),
    conventionRoutes: ({ zod }) =>
      zod.object({
        base: zod.string(),
        exclude: zod.array(zod.any()),
      }),
    esbuildMinifyIIFE: ({ zod }) => zod.boolean(),
    headScripts: ({ zod }) =>
      zod.array(
        zod.union([
          zod.string().optional(),
          zod.object({
            src: zod.string().optional(),
          }),
          zod.object({
            content: zod.string().optional(),
          }),
        ]),
      ),
    history: ({ zod }) =>
      zod.object({
        type: zod.enum(['browser', 'hash', 'memory']),
      }),
    historyWithQuery: ({ zod }) => zod.object({}),
    links: ({ zod }) =>
      zod.array(
        zod.object({
          crossorigin: zod.enum(['anonymous', 'use-credentials']).optional(),
          href: zod.string().optional(),
          hreflang: zod.string().optional(),
          media: zod.string().optional(),
          referrerpolicy: zod
            .enum([
              'no-referrer',
              'no-referrer-when-downgrade',
              'origin',
              'origin-when-cross-origin',
              'unsafe-url',
            ])
            .optional(),
          rel: zod
            .enum([
              'alternate',
              'author',
              'dns-prefetch',
              'help',
              'icon',
              'license',
              'next',
              'pingback',
              'preconnect',
              'prefetch',
              'preload',
              'prerender',
              'prev',
              'search',
              'stylesheet',
            ])
            .optional(),
          sizes: zod.any().optional(),
          title: zod.any().optional(),
          type: zod.any().optional(),
        }),
      ),
    metas: ({ zod }) =>
      zod.array(
        zod.object({
          charset: zod.string().optional(),
          content: zod.string().optional(),
          'http-equiv': zod.string().optional(),
          name: zod
            .enum([
              'application-name',
              'author',
              'description',
              'generator',
              'keywords',
              'viewport',
            ])
            .optional(),
        }),
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
      zod
        .string()
        .regex(/(\/|^auto)$/, {
          message: 'publicPath must be "auto" or end with /',
        }),
    reactRouter5Compat: ({ zod }) => zod.union([zod.boolean(), zod.object({})]),
    // TODO 给类型
    routes: ({ zod }) => zod.array(zod.any()),
    scripts: ({ zod }) => zod.array(zod.any()),
    styles: ({ zod }) => zod.array(zod.any()),
    title: ({ zod }) => zod.string(),
  };
}
