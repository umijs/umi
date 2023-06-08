import { Tabbed, Message } from 'umi';

# Uno CSS 插件

在 Max 项目使用 Uno CSS 功能。

## 配置

使用微生成器一键开启 Uno CSS 插件

<Tabbed>

Max 项目

```bash
npx max g unocss
info  - Update package.json for devDependencies
set config:unocss on /.umirc.ts
set config:plugins on /.umirc.ts
info  - Update .umirc.ts
info  - Write uno.config.ts
```

Umi 项目

```bash
npx umi g unocss
info  - Update package.json for devDependencies
set config:unocss on /.umirc.ts
set config:plugins on /.umirc.ts
info  - Update .umirc.ts
info  - Write uno.config.ts
```

</Tabbed>

至此就可以在项目中使用 Uno CSS 的样式；项目根目录的 `uno.config.js` 根据需要修改配置。


## 升级指南 4.0.70+

Umi 小于 `4.0.70` 版本的 unocss 功能是由 `@unocss/cli` 进程侧载监听文件变化的方式运行的。这在与 Turborepo 一起使用时存在不兼容的问题，故修改为借助 [`@unocss/webpack`](https://unocss.dev/integrations/webpack) 来支持 unocss 。

如果你有在 < `4.0.70` 版本使用到 unocss 功能，请按以下方式迁移升级：

### 使用微生成器升级

1、删除 `unocss.config.ts` 文件

2、config/config.ts 或者 .umirc.ts 文件中删除配置 

```diff
export default { 
-    unocss: {
-       watch: ['pages/**/*.tsx'],
-    }, 
-    plugins: ["@umijs/plugins/dist/unocss"] 
};
```

> watch 配置不再必要，我们将在未来某个版本直接删掉 watch 选项

执行微生成器，重新初始化 unocss 插件

```bash
$ npx umi g unocss
或者
$ npx max g unocss
```

3、 比对 `unocss.config.ts` 和  `uno.config.ts` 文件差异，保留之前的 defineConfig 配置

4、 项目中移除 `@unocss/cli` 依赖

### 手动升级

将 `unocss.config.ts` 重命名为 `uno.config.ts`，移除 `createConfig` 那一层，直接 `export default defineConfig()`

```diff
import { defineConfig, presetAttributify, presetUno } from 'unocss';

- export function createConfig({ strict = true, dev = true } = {}) {
   return defineConfig({
     envMode: dev ? 'dev' : 'build',
     presets: [presetAttributify({ strict }), presetUno()],
   });
- }

- export default createConfig();
+ export default defineConfig({
+     presets: [presetAttributify(), presetUno()],
+ });
```

在 config/config.ts 或者 .umirc.ts 文件中删除配置 

```diff
export default { 
-    unocss: {
-       watch: ['pages/**/*.tsx'],
-    }, 
-    plugins: ["@umijs/plugins/dist/unocss"] 
};
```

> watch 配置不再必要，我们将在未来某个版本直接删掉 watch 选项

最后在项目中移除 `@unocss/cli` 依赖