# Upgrade to Umi 3

This document will guide you through the process of upgrading from Umi 2.x to Umi 3.x.

## package.json

Update the version of `umi` to `^3.0.0` or higher in your `package.json`:

```diff
{
  "devDependencies": {
-   "umi": "^2"
+   "umi": "^3"
  }
}
```

Since Umi 3 requires Node 10.13 or higher, make sure to check your `engines` configuration if you had it defined previously.

## tsconfig.json

For better TypeScript type checking, configure `@@` to `["src/.umi/*"]` in your `tsconfig.json`:

```diff
+ "@@/*": ["src/.umi/*"]
```

## Upgrade `umi-plugin-react` to `@umijs/preset-react`

If you were previously using `umi-plugin-react`, follow these steps to upgrade:

First, update the dependency in your `package.json`:

```diff
{
  "devDependencies": {
-   "umi-plugin-react": "^1"
+   "@umijs/preset-react": "^1"
  }
}
```

Then, because Umi 3 uses a flattened configuration format, you need to modify your configuration. Instead of using plugins, you'll directly configure your plugins and options:

```diff
export default {
- plugins: [
-   ['umi-plugin-react', {
-     dva: {},
-     antd: {},
-     ...
-   }]
- ],
+ dva: {},
+ antd: {},
+ ...
}
```

Notes:

1. There's no need to redundantly register plugins in Umi 3; Umi 3 will automatically register dependencies from your `package.json`.
2. Configuration has been extracted to the top level.

Changes in functionality:

- Removed `routes`, `library`, `dll`, `hardSource`, `pwa`, `hd`, `fastClick`, and `chunks`. These are no longer available.
- Built-in `dynamicImport`, `title`, `scripts`, `headScripts`, `metas`, and `links` into Umi, and they can still be used.
- Other functionalities remain unchanged.

## Configuration Layer

Umi 3 has significantly streamlined the configuration layer. Below are modifications sorted alphabetically for easier reference:

- Removed `browserslist`, as it was redundant with `targets`.
- Removed `babel`, which is rarely needed.
- Renamed `cssLoaderOptions` to `cssLoader`.
- Removed `cssLoaderVersion`, keeping only version 2 of `css-loader`.
- Removed `cssPublicPath`. Using a relative path `./` for CSS resource files covers all scenarios and eliminates the need for this configuration.
- Removed `disableGlobalVariables`, as there are no global variables by default, so no need for configuration.
- Removed `disableRedirectHoist`, as redirect hoisting is no longer performed.
- Removed `disableCSSModules` and `cssModulesWithAffix`. Umi 3 automatically detects the use of CSS modules, so no need for configuration.
- Removed `extraBabelIncludes` and `es5ImcompatibleVersions`. Compiling `node_modules` with Babel is no longer meaningful in Umi 3, so no need for configuration.
- Changed the format of `history` to `{ type, options }`, and string format is no longer supported.
- Renamed `lessLoaderOptions` to `lessLoader`.
- Removed `minimizer`, keeping only `terserjs`.
- Changed the format of `plugins` to strings. Ensure that the plugins you depend on have been updated to Umi 3, and then modify them as shown in the previous `umi-plugin-react` upgrade steps.
- Removed `sass`, which is no longer supported and will be provided as a plugin in the future.
- Removed `treeShaking`, as it's already built-in and doesn't require configuration.
- Removed `tsConfigFile`, as it's unnecessary.
- Removed `typescript`. After TypeScript compilation is handled by Babel, the previous `ts-loader` configuration is no longer needed.
- Removed `uglifyJSOptions`, as it's unnecessary.
- Removed `urlLoaderExcludes`, as it's unnecessary.

## Environment Variable Layer

## Code Layer

### Import All from Umi

All `umi/xxx` interfaces have been removed. Instead, import everything from `umi`.

For example:

```diff
- import Link from 'umi/link';
+ import { Link } from 'umi';
```

### `umi/router`

Replace `umi/router` with `history`.

```diff
- import router from 'umi/router';
+ import { history } from 'umi';

- router.push('/foo');
+ history.push('/foo');
```

### Referencing Aliases or Third-Party Libraries in CSS

You need to prefix with `~` when referencing aliases or third-party libraries in CSS.

For example:

```diff
# Aliases
- background: url(@/assets/logo.png);
+ background: url(~@/assets/logo.png);

# Third-party libraries
- @import url(foo/bar.css);
+ @import url(~foo/bar.css);
```

## Troubleshooting

Umi 3 introduces numerous refinements and refactorings, and we've made every effort to collect all known breaking changes and related impacts. However, there might still be scenarios we haven't considered. If you encounter any issues during the upgrade process, please provide feedback on the [Github issues](https://github.com/umijs/umi/issues) page. We will respond promptly and make corresponding improvements to this document.

You can also join the "Umi 3 Upgrade Support" group by scanning the QR code below:

![Umi 3 Upgrade Support QR Code](https://img.alicdn.com/imgextra/i1/O1CN01SXbs9I28PhUahMoWZ_!!6000000007925-0-tps-1170-1503.jpg)

Scan the QR code and reply with **umi 3** to join the group for assistance.
