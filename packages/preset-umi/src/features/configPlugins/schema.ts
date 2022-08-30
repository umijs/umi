// sort-object-keys
import { NpmClientEnum } from '@umijs/utils';
import type { Root } from '@umijs/utils/compiled/@hapi/joi';

export function getSchemas(): Record<string, (Joi: Root) => any> {
  return {
    base: (Joi) => Joi.string(),
    conventionRoutes: (Joi) =>
      Joi.object({
        base: Joi.string(),
        exclude: Joi.array().items(Joi.any()),
      }),
    headScripts: (Joi) => Joi.array(),
    history: (Joi) =>
      Joi.object({
        type: Joi.string().valid('browser', 'hash', 'memory'),
      }),
    links: (Joi) => Joi.array(),
    metas: (Joi) => Joi.array(),
    mountElementId: (Joi) => Joi.string(),
    npmClient: (Joi) =>
      Joi.string().valid(
        NpmClientEnum.pnpm,
        NpmClientEnum.tnpm,
        NpmClientEnum.cnpm,
        NpmClientEnum.yarn,
        NpmClientEnum.npm,
      ),
    plugins: (Joi) => Joi.array().items(Joi.string()),
    presets: (Joi) => Joi.array().items(Joi.string()),
    publicPath: (Joi) =>
      Joi.string()
        .regex(/(\/|^auto)$/)
        .error(new Error('publicPath must be "auto" or end with /')),
    routes: (Joi) => {
      const stringRule = Joi.string().allow(null, '');
      const Route = Joi.object({
        // 权限配置，需要与 plugin-access 插件配合使用
        access: stringRule,
        component: stringRule,
        // 子项往上提，仍旧展示,
        flatMenu: Joi.boolean(),
        // 不展示页脚
        footerRender: Joi.boolean(),
        headerRender: Joi.boolean(),
        // 隐藏子菜单
        hideChildrenInMenu: Joi.boolean(),
        // 在面包屑中隐藏
        hideInBreadcrumb: Joi.boolean(),
        // 隐藏自己和子菜单
        hideInMenu: Joi.boolean(),
        icon: stringRule,
        // 不展示菜单顶栏
        menuHeaderRender: Joi.boolean(),
        // 不展示菜单
        menuRender: Joi.boolean(),
        microApp: stringRule,
        name: stringRule,
        path: stringRule,
        redirect: stringRule,
        routes: Joi.array().items(Joi.link('#route')),
        target: stringRule,
        title: stringRule,
        wrappers: Joi.array().items(stringRule),
      })
        .unknown()
        .id('route');
      // joi2types 不支持这种嵌套结构， 对 joi.link 的处理是直接使用 any
      return Joi.array().items(Route);
    },
    scripts: (Joi) => Joi.array(),
    styles: (Joi) => Joi.array(),
    title: (Joi) => Joi.string(),
  };
}
