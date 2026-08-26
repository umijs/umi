---
toc: content
order: 0
group:
  title: Blog
---

# Announcing Umi 4.7

![Umi 4.7 release poster](/images/blog/umi-4-7/poster.png)

Hi everyone, Umi 4.7 is officially available.

This release is not defined by bundler version bumps. Beyond the Vite 7 and webpack 5.x upgrades, Umi 4.7 moves the application runtime, compilation, styling pipeline, and everyday developer experience forward.

🚀 utoopack in the default templates<br /> ⚛️ React 19, React Compiler, and Ant Design 6<br /> 🎨 Tailwind CSS 4 and a leaner development pipeline<br /> 🛡️ Compatibility, security, and runtime extensions<br />

## 1. utoopack Comes to the Default Templates

The centerpiece of Umi 4.7 is utoopack moving from an optional experimental feature into the default templates for new projects.

The integration now covers the engineering workflows required for everyday development and production builds.

### A New Rust-Based Build Engine

[utoopack](https://utoo.land/zh/docs/blog/utoopack-intro) is the next-generation Rust bundler in the Utoo toolchain. Umi 4.7 integrates utoopack 1.5.

It builds on Turbopack's incremental computation engine and adds an independent Node API, general-purpose build configuration, and a webpack compatibility layer.

Existing projects can enable it with a single [`utoopack`](../docs/api/config#utoopack) option:

```ts
// .umirc.ts
import { defineConfig } from 'umi';

export default defineConfig({
  utoopack: {},
});
```

New Umi and Umi Max project templates include this option by default. Existing projects are not switched automatically, so teams can validate and migrate at their own pace.

This integration is more than replacing a build command with a faster binary. Umi adds a development server, HMR, error overlays, persistent caching, WebSocket proxying, and common engineering options.

Those options include `publicPath`, `externals`, and `define`.

The styling and asset pipelines cover Less, Sass, CSS Modules, Emotion, Tailwind CSS 4, SVGR, and MDX. SSR, qiankun 2, React Compiler, and Windows development environments are also adapted and tested.

In development mode, utoopack no longer generates complete stats by default. Instead, it creates a lightweight compatibility result containing only the data Umi needs, reducing extra startup work.

Full stats can still be enabled when detailed output analysis is required.

Monorepos can watch selected packages under `node_modules` using configurable rules. HMR logging also omits noisy connection and compilation messages, making linked-dependency debugging and the browser console easier to follow.

### Performance in Real-World Projects

Data collected from medium-to-large production projects shows roughly 3×–10× speedups over webpack in development startup or production builds.

Actual results depend on project size, cache state, loaders, Babel configuration, and dependency structure. This range should not be treated as a guaranteed result for every project.

utoopack requires Node.js 20 or later. Projects that rely heavily on custom webpack plugins or loaders should validate development, production builds, and critical pages on a branch and in CI before switching.

## 2. A Modern Baseline for React 19 Applications

Beyond the build engine, Umi 4.7 advances the foundations of modern React applications with improved React 19 compatibility, React Compiler integration, and official plugin support for Ant Design 6.

### React 19 and Ant Design 6

React 19 support goes beyond dependency upgrades. The data-flow plugin now writes initial model values and notifies subscribers at safer times, avoiding cross-component updates during render.

qiankun child applications also prefer the new Root API when unmounting, instead of relying on legacy APIs removed by React 19.

Ant Design 6 is now recognized by the modern branch of the official plugin. Theme algorithms, `ConfigProvider`, `App`, and runtime configuration continue to work as expected.

Umi also skips the reset styles that only apply to Ant Design 5 and addresses version-specific differences in layout, locale, and icon collection.

### React Compiler: A First-Class, Cross-Bundler Feature

[React Compiler](https://react.dev/learn/react-compiler) analyzes components and Hooks at build time. It automatically applies some optimizations that previously required `useMemo`, `useCallback`, or `React.memo`.

Umi 4.7 introduces a first-class configuration option with the same name:

```ts
export default defineConfig({
  reactCompiler: true,
});
```

The configuration object is passed directly to `babel-plugin-react-compiler`. React 19 is the default target. React 17 and 18 projects must set the corresponding `target` and install `react-compiler-runtime`.

```ts
export default defineConfig({
  reactCompiler: {
    target: '18',
  },
});
```

React Compiler works with webpack, Vite, and utoopack. It cannot currently be enabled together with MFSU or Mako.

The legacy `forget` option remains supported for compatibility but is deprecated. We recommend migrating to `reactCompiler`.

For existing projects, enable it gradually. Make sure the code follows the Rules of React, then verify the output with unit tests, end-to-end tests, and React DevTools before removing hand-written memoization.

## 3. Leaner Styling and Development Pipelines

Umi 4.7 also revisits repeated work in style generation, prepare, file watching, and terminal output instead of focusing only on the bundler itself.

### Tailwind CSS 4: Fewer Processes, a Shorter Pipeline

Umi 4.7 redesigns the [Tailwind CSS 4 integration](../docs/max/tailwindcss#tailwind-css-v4). In webpack and utoopack modes, the Umi plugin adds its built-in `@tailwindcss/webpack` loader to the build configuration.

The build engine can then process the project's root-level `tailwind.css` directly.

The previous implementation started a separate Tailwind CLI child process, waited for it to generate temporary CSS, and then added the generated file to the application entry.

The new loader pipeline removes both the child process and the temporary file. Development watching, HMR, and production builds now share a single build lifecycle.

Projects no longer need to install `@tailwindcss/cli`; only Tailwind CSS 4 is required:

```bash
pnpm add tailwindcss@^4
```

`tailwind.css` can use the CSS-first configuration introduced in v4:

```css
@import 'tailwindcss';

@source './src/**/*.{js,jsx,ts,tsx}';
```

The existing Tailwind CSS 3 CLI workflow remains available. Development mode now uses `--watch=always`, preventing the watcher from exiting early when its input stream changes.

Both existing and new projects can therefore upgrade on their own schedule.

### Eliminating Redundant Development Work

The first `umi dev` startup includes a prepare phase. Previously, Umi parsed imports from every JavaScript file again after prepare finished, even though nothing downstream consumed the result.

Umi 4.7 removes this unnecessary scan and fixes a related parser issue that could terminate the process in Flow projects.

Temporary-file watchers can now filter by event. Plugins can react only to the `add`, `unlink`, or `change` events that actually affect generated files, avoiding unnecessary regeneration.

Icon plugin logging is deduplicated as well. The generated icon list is printed again only when the set changes, keeping the terminal quieter and making important messages easier to spot.

## 4. Compatibility, Security, and Runtime Extensibility

Alongside performance and ecosystem upgrades, Umi 4.7 improves support for new Node.js versions, security boundaries, and enterprise extension scenarios.

### Node.js 24 and Development Server Security

Node.js 24 removed the private `http_parser` API used indirectly by `spdy`. Umi now loads `spdy` lazily and falls back to the built-in `https.createServer` on Node.js 24 and later.

This prevents local HTTPS servers from crashing during startup.

The development server now validates project-root boundaries, preventing path traversal from reading files outside the workspace when serving JavaScript files for debugging.

The Git file information utility also uses parameterized execution instead of concatenating file paths into shell commands.

These changes require no additional project configuration. They make local development more robust on new Node.js versions, with unusual file names, and when handling untrusted requests.

### More Flexible Runtime Extensions

- Module Federation remotes now support `runtimeEntryPath`, allowing the remote entry URL to be resolved at runtime.
- serverLoader adds a `modifyServerLoaderRequest` runtime hook for changing the URL, headers, and other fetch options before calling a gateway directly.
- SSG output now preserves the `property` attribute on `<meta>` elements, so Open Graph and similar metadata survives static generation.

### Bundler Baseline Upgrades

Umi's built-in Vite moves from 4.5.2 to 7.3.6, together with upgrades to `@vitejs/plugin-react`, `@vitejs/plugin-legacy`, and Rollup.

The way Vite mode is enabled remains unchanged, but Node.js must satisfy `^20.19.0` or `>=22.12.0`.

Because this crosses three Vite major versions—5, 6, and 7—projects using low-level options or custom plugins should follow the [Vite migration guide](https://v7.vite.dev/guide/migration) and run a full regression test.

webpack moves from 5.88.2 to 5.105.4. The upgrade includes compatibility, security, and module-resolution fixes, and resolves production minification issues with complex dependencies such as `@arcgis/core`.

Existing webpack projects receive these updates without configuration changes.

## How to Upgrade

For Umi projects, run:

```bash
pnpm up umi@^4.7.0
```

For Umi Max projects, run:

```bash
pnpm up @umijs/max@^4.7.0
```

After upgrading, we recommend checking the following:

1. For React 19 or Ant Design 6 projects, test data flow, micro-frontend unmounting, layout, locale, and theme configuration.
2. When enabling React Compiler, disable MFSU and Mako, and pay particular attention to Effects and reference-equality-sensitive logic.
3. When using utoopack, use Node.js 20 or later, enable only one bundler at a time, and validate development, builds, and deployment output.
4. After upgrading to Tailwind CSS 4, remove `@tailwindcss/cli`; webpack and utoopack use the loader built into the Umi plugin.
5. When using Vite 7, make sure Node.js satisfies `^20.19.0 || >=22.12.0`.
6. When building a qiankun 2 child application with utoopack, use qiankun `2.10.17-beta.0` or later in the host application.

From React 19 and React Compiler to utoopack, Tailwind CSS 4, and a leaner development pipeline, Umi 4.7 is not about adding more version numbers.

It is about making the next generation of application capabilities easier to adopt in real projects while preserving a safe upgrade path for existing ones.

Give Umi 4.7 a try. If you run into issues, let us know in [Umi GitHub Issues](https://github.com/umijs/umi/issues). Contributions that improve utoopack and the other build engines are welcome as well.
