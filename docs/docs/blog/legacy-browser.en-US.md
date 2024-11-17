---
toc: content
order: 6
group:
  title: Blog
---

# 非现代浏览器兼容

## 默认兼容说明

Umi 4 默认不支持 IE ，编译兼容目标 `targets` 为 `chrome: 80` ，如需调整，请指定明确的 [targets](../docs/api/config#targets) ：

```ts
// .umirc.ts

export default {
  targets: { chrome: 67 },
};
```

若想反馈更多关于兼容性的问题，或参与讨论，请前往：[issue / 8656](https://github.com/umijs/umi/issues/8658)

## 兼容非现代浏览器

如果你并不需要兼容至 IE ，只为了提升项目对非现代浏览器的兼容性，可调整兼容目标 [targets](../docs/api/config#targets) 。

Umi 4 默认使用现代构建工具，产物生成至 `es6` ，如果你有要打包为 `es5` 产物的考量，请调整配置：

```ts
// .umirc.ts

export default {
  jsMinifier: 'terser',
  cssMinifier: 'cssnano',
};
```

## 兼容旧时代浏览器 ( IE 11 )

由于 IE 已经淘汰不再主流，当需要兼容至 IE 时，请阅读以下对策。

### 框架自带的 legacy mode

Umi 4 自带提供一个 `legacy` 配置用于构建降级（使用限制等详见 [legacy](../docs/api/config#legacy) ）：

```ts
// .umirc.ts

export default {
  legacy: {},
};
```

默认仅在构建时生效，将尝试构建能使 IE 兼容的产物。

### legacy mode 的更多自定义

`legacy` 开启时，默认会转译全部 `node_modules` ，这在大型项目中，会极大的增加构建时间。

若你了解当前项目使用的第三方依赖情况（知道哪些不再提供 `es5` 产物了），可以关闭 `node_modules` 的转换，改为使用 [`extraBabelIncludes`](https://umijs.org/docs/api/config#extrababelincludes) 定点配置那些需要额外纳入转换范围的包。

一个例子：

```ts
// .umirc.ts

export default {
  legacy: {
    nodeModulesTransform: false,
  },
  extraBabelIncludes: ['some-es6-pkg', /@scope\//],
};
```

### 提高兼容的鲁棒性

`legacy` 选项并不能 100% 保证产物 **没有边界情况** 的运行在被淘汰的浏览器内，你可能还需要添加 **前置的** 全量 polyfill 来增强项目的 [鲁棒性](https://baike.baidu.com/item/%E9%B2%81%E6%A3%92%E6%80%A7/832302) 。

```ts
// .umirc.ts

export default {
  headScripts: [
    'http://polyfill.alicdn.com/v3/polyfill.min.js', // or https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js
  ],
  legacy: {},
};
```

参考的思路有：

| 方案               | 说明                                                                                                                                                                                                                                                                                                                                                  |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CDN 引入           | 以 cdn 形式引入 **script 形式且前置的** 、目标浏览器环境缺少的 polyfill js 文件，如 [es6-shim](https://github.com/paulmillr/es6-shim) 。                                                                                                                                                                                                              |
| 人工 core-js       | 利用 [core-js](https://github.com/zloirock/core-js) 系工具，如通过 [core-js-builder](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder) 构建自己需要的 polyfill 产物，再以 **前置 script 脚本** 形式引入项目。                                                                                                                 |
| 动态 polyfill 服务 | 使用根据当前浏览器请求 UA 动态下发所需 polyfill 的服务，比如 [polyfill.io (alicdn)](http://polyfill.alicdn.com/v3/polyfill.min.js) 或 [polyfill.io (CloudFlare)](https://cdnjs.cloudflare.com/polyfill/) 服务。另外，你还可以使用 [polyfill-service](https://github.com/cdnjs/polyfill-service) 自建相同的动态 polyfill 下发服务。 |

注：

1. 当你处于内外网隔离开发环境时，可以考虑将全部 polyfill 的 js 内容传入内网，在内网的 CDN 使用，或放入 public 目录等方式使用。

2. 使用 script 前置引入的意义在于，在项目 js 资源运行前就准备好一个完整的、被 polyfill 过 api 的环境。

### 在开发环境验证

推荐的做法是：构建后在本地通过 [`umi preview`](../docs/api/commands#preview) 或 [`serve`](https://www.npmjs.com/package/serve) 、nginx 等启动服务，来验证产物的 IE 11 运行可行性。

当你需要在开发环境验证时：

1. 将 `legacy.buildOnly` 置为 `false` 。

2. 由于 react fresh 、hmr 等开发注入的 es6 代码始终在第一位运行，你需要以 script 形式添加一个前置的 polyfill ，提前准备好环境。

```ts
// .umirc.ts

const isProd = process.env.NODE_ENV === 'production';
export default {
  legacy: {
    buildOnly: false,
  },
  headScripts: isProd ? [] : ['http://polyfill.alicdn.com/v3/polyfill.min.js'],
};
```

注：IE 11 并不能完整支持开发时的热更新，且缓存可能需要人为在控制台进行清除后才能看到最新的页面，请做好准备。
