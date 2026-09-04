---
toc: content
order: 0
group:
  title: Blog
---

# Umi 4.7 发布

![Umi 4.7 发布海报](/images/blog/umi-4-7/poster.png)

大家好，Umi 4.7 正式发布了。

这不是一次以 bundler 版本为主角的更新。相比 Vite 7 和 webpack 5.x 的基础升级，Umi 4.7 更值得关注的是应用运行时、编译能力、样式链路和日常研发体验的整体演进。

🚀 utoopack 进入默认模板<br /> ⚛️ React 19、React Compiler 与 Ant Design 6<br /> 🎨 Tailwind CSS 4 与更轻的开发链路<br /> 🛡️ 新环境兼容、安全边界与运行时扩展<br />

## 一、utoopack 进入默认模板

Umi 4.7 最核心的变更，是 utoopack 从可选实验能力走进新项目默认模板，并补齐日常研发与生产构建所需的完整工程链路。

### 新的 Rust 构建引擎

[utoopack](https://utoo.land/zh/docs/blog/utoopack-intro) 是 Utoo 工具链中的新一代 Rust Bundler。Umi 4.7 接入 utoopack 1.5；它基于 Turbopack 的增量计算引擎，并在此之上补充了独立的 Node API、通用构建配置和 webpack 兼容层。

在已有项目中，只需增加一项 [`utoopack`](../docs/api/config#utoopack) 配置即可启用：

```ts
// .umirc.ts
import { defineConfig } from 'umi';

export default defineConfig({
  utoopack: {},
});
```

新创建的 Umi 和 Umi Max 项目模板已经默认带上这项配置。老项目不会被自动切换，可以按自己的节奏进行验证和迁移。

这次接入不只是把构建命令换成一个更快的二进制。Umi 为 utoopack 补齐了开发服务器、HMR、错误浮层、持久化缓存、WebSocket 代理，以及 `publicPath`、`externals`、`define` 等常用工程能力。

样式和资源链路也覆盖了 Less、Sass、CSS Modules、Emotion、Tailwind CSS 4、SVGR 和 MDX。SSR、qiankun 2、React Compiler 与 Windows 开发环境都有对应的适配和测试。

在启动性能上，utoopack 开发模式默认不再生成完整 stats，而是按 Umi 所需的数据构造轻量兼容结果，减少首次启动的额外工作。需要分析完整产物时，仍可通过配置重新开启 stats。

Monorepo 项目还可以按规则监听指定的 `node_modules` 包。HMR 日志也去掉了无意义的连接与编译提示，链接依赖的调试更直接，浏览器控制台也更干净。

### 真实项目中的性能收益

目前收集到的中大型业务项目数据中，utoopack 相比 webpack 的 dev 启动或生产构建可达到约 3×–10× 的性能提升。实际收益取决于项目规模、缓存状态、loader、Babel 配置和依赖结构，不应将这一范围理解为所有项目的固定保证。

utoopack 需要 Node.js 20 或更高版本。高度依赖自定义 webpack 插件或 loader 的项目，建议先在分支和 CI 中完成开发、生产构建与核心页面回归，再决定是否切换。

## 二、面向 React 19 的应用基线

在构建引擎之外，Umi 4.7 也把现代 React 应用的关键能力向前推进了一步：完善 React 19 运行时兼容，接入 React Compiler，并让 Ant Design 6 进入官方插件的支持范围。

### React 19 与 Ant Design 6

React 19 的兼容不只是升级依赖版本。数据流插件调整了 model 初始值的写入和订阅通知时机，避免在 render 阶段触发跨组件更新；qiankun 子应用卸载也优先使用新 Root API，不再依赖 React 19 已移除的旧接口。

Ant Design 6 被纳入官方插件的现代版本分支，主题算法、`ConfigProvider`、`App` 和运行时配置可以继续沿用。Umi 也会跳过仅适用于 Ant Design 5 的 reset 样式，并同步修复 layout、locale 与图标收集的版本差异。

### React Compiler：正式、跨构建器的编译能力

[React Compiler](https://react.dev/learn/react-compiler) 会在构建阶段分析组件和 Hook，并自动完成过去常由 `useMemo`、`useCallback` 和 `React.memo` 承担的部分优化。Umi 4.7 提供了与其同名的正式配置入口：

```ts
export default defineConfig({
  reactCompiler: true,
});
```

配置对象会直接传给 `babel-plugin-react-compiler`。默认目标是 React 19；React 17 或 18 项目需要设置对应的 `target`，并安装 `react-compiler-runtime`。

```ts
export default defineConfig({
  reactCompiler: {
    target: '18',
  },
});
```

React Compiler 可配合 webpack、Vite 和 utoopack 使用，暂时不能与 MFSU、Mako 同时开启。原有的 `forget` 配置仍可兼容，但已经废弃，建议迁移到 `reactCompiler`。

对于已有项目，我们仍建议渐进启用：先确保代码遵循 Rules of React，再通过单元测试、端到端测试和 React DevTools 验证编译结果，而不是启用后立即删除所有手写 memoization。

## 三、样式与开发链路继续减负

Umi 4.7 不只关注构建器本身，也重新审视了样式生成、prepare、文件监听和终端输出中的重复工作。

### Tailwind CSS 4：更少的进程，更短的链路

Umi 4.7 重新设计了 [Tailwind CSS 4 的接入方式](../docs/max/tailwindcss#tailwind-css-v4)。在 webpack 和 utoopack 模式下，Umi 插件会将内置的 `@tailwindcss/webpack` loader 直接加入构建配置，由构建引擎处理项目根目录的 `tailwind.css`。

此前的实现需要单独启动 Tailwind CLI 子进程，等待它生成临时 CSS，再把产物加入应用入口。新的 loader 链路不再依赖子进程和临时文件，开发监听、HMR 与生产构建都回到同一条构建生命周期中。

项目也不再需要额外安装 `@tailwindcss/cli`，只需保留 Tailwind CSS 4：

```bash
pnpm add tailwindcss@^4
```

`tailwind.css` 可以直接使用 v4 的 CSS-first 配置方式：

```css
@import 'tailwindcss';

@source './src/**/*.{js,jsx,ts,tsx}';
```

Tailwind CSS 3 的原有 CLI 流程仍然保留，同时开发模式改用 `--watch=always`，避免监听进程因为输入流变化而提前退出。新旧项目都可以按照自己的节奏升级。

### 移除开发过程中的重复工作

`umi dev` 首次启动时会经过 prepare 阶段。过去 prepare 构建完成后，还会再次解析所有 JavaScript 文件的 import；这份结果没有被下游使用。Umi 4.7 移除了这次多余扫描，也一并解决了 parser 在 Flow 项目中可能导致进程退出的问题。

临时文件监听也支持按事件过滤。插件可以只关心 `add`、`unlink` 或 `change` 中真正会影响临时文件的事件，避免无关文件变化触发重复生成。

图标插件的日志同样做了去重：只有图标集合发生变化时才重新输出生成信息，让开发终端更安静，也更容易看到真正需要处理的内容。

## 四、兼容性、安全与运行时扩展

除了性能与生态升级，Umi 4.7 也补齐了新 Node.js 版本、安全边界和企业级扩展场景。

### Node.js 24 与开发服务器安全

Node.js 24 移除了 `spdy` 间接依赖的私有 `http_parser` API。Umi 现在会延迟加载 `spdy`，并在 Node.js 24 及以上回退到内置的 `https.createServer`，避免本地 HTTPS 服务在启动阶段崩溃。

开发服务器增加了项目根目录边界校验，阻止调试静态 JavaScript 文件时通过路径穿越读取工作区外文件。Git 文件信息工具也改为参数化执行，不再把文件路径拼进 shell 命令。

这些调整不需要业务项目增加配置，但会让本地研发在新 Node.js 版本、特殊文件名和非可信请求下更稳健。

### 更灵活的运行时扩展

- Module Federation remote 新增 `runtimeEntryPath`，可以在运行时确定 remote entry 地址。
- serverLoader 新增 `modifyServerLoaderRequest` 运行时钩子，可以在直连网关前调整 URL、请求头和其他 fetch 参数。
- SSG 输出现在会保留 `<meta>` 的 `property` 属性，Open Graph 等页面元数据不会在静态化过程中丢失。

### 构建器基础版本同步

Umi 内置的 Vite 从 4.5.2 升级到 7.3.6，并同步升级了 `@vitejs/plugin-react`、`@vitejs/plugin-legacy` 和 Rollup。Vite 模式的开启方式保持不变，但 Node.js 需要满足 `^20.19.0` 或 `>=22.12.0`。

由于跨越 Vite 5、6、7 三个大版本，使用底层选项或自定义插件的项目仍建议对照 [Vite 迁移指南](https://v7.vite.dev/guide/migration) 完成回归。

webpack 则从 5.88.2 升级到 5.105.4，带来兼容性、安全性和模块解析修复，也解决了 `@arcgis/core` 等复杂依赖的生产压缩问题。现有 webpack 项目无需修改配置即可获得这些更新。

## 如何升级

Umi 项目可以执行：

```bash
pnpm up umi@^4.7.0
```

Umi Max 项目可以执行：

```bash
pnpm up @umijs/max@^4.7.0
```

升级后建议依次确认以下事项：

1. React 19 或 Ant Design 6 项目重点回归数据流、微前端卸载、layout、locale 和主题配置。
2. 启用 React Compiler 时关闭 MFSU 和 Mako，并重点回归 Effect 与引用相等相关逻辑。
3. 使用 utoopack 时，Node.js 版本不低于 20；一次只启用一个构建器，并完整验证 dev、build 和部署产物。
4. 升级 Tailwind CSS 4 后可移除 `@tailwindcss/cli`，webpack 和 utoopack 会使用 Umi 插件内置的 loader。
5. 使用 Vite 7 时，Node.js 满足 `^20.19.0 || >=22.12.0`。
6. utoopack 构建 qiankun 2 子应用时，主应用使用 qiankun `2.10.17-beta.0` 或更高版本。

从 React 19 与 React Compiler，到 utoopack、Tailwind CSS 4 和更轻的开发链路，Umi 4.7 的重点不是多几个版本号，而是让新一代应用能力可以更平滑地进入真实项目，同时继续守住已有项目的升级路径。

欢迎升级体验。如果遇到问题，请在 [Umi GitHub Issues](https://github.com/umijs/umi/issues) 中反馈，也欢迎一起完善 utoopack 和其他构建引擎的能力。
