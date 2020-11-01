---
translateHelp: true
---

# Upgrade to Umi 3


This document will help you upgrade from Umi 2.x version to Umi 3.x version.

## package.json

Modify the version of ʻumi` to `^3.0.0` or above,

```diff
{
  "devDependencies": {
-   "umi": "^2"
+   "umi": "^3"
  }
}
```

Since Umi 3 requires Node 10.13 or above, if you have engines before, you need to confirm the version number.

## tsconfig.json

In order to have a better ts prompt, you need to configure `@@` as `["src/.umi/*"]`.

```diff
+ "@@/*": ["src/.umi/*"]
```

## Upgrade umi-plugin-react to @umijs/preset-react

If you have used ʻumi-plugin-react` before, here are the steps to modify it.

First modify the dependencies in package.json,

```diff
{
  "devDependencies": {
-   "umi-plugin-react": "^1"
+   "@umijs/preset-react": "^1"
  }
}
```

Then since the configuration of Umi 3 is flat, the configuration needs to be modified.

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

note:

1. No need to register plug-ins repeatedly, Umi 3 will automatically register Umi plug-ins in dependencies
2. Extract the configuration to the outside

Functional changes,

* Deleted routes, library, dll, hardSource, pwa, hd, fastClick, chunks, no longer available
* Built-in dynamicImport, title, scripts, headScripts, metas and links into Umi, you can continue to use it
* Other functions remain unchanged

## Configuration layer

Umi 3 has made a lot of simplifications in the configuration layer. The following changes are sorted in alphabetical order for easy searching.

* Delete browserslist and duplicate targets
* Delete babel, basically no use
* Modify cssLoaderOptions and name it cssLoader
* Delete cssLoaderVersion, only keep the version of css-loader@2
* Delete cssPublicPath, and use relative path `./` for resource files referenced by css to satisfy all scenarios, no need to reconfigure
* Delete disableGlobalVariables, there is always no global variables, no need to configure
* Delete disableRedirectHoist and never do redirect hoist anymore
* Delete disableCSSModules and cssModulesWithAffix, Umi 3 automatically recognizes the use of css modules, no configuration is required
* Delete extraBabelIncludes and es5ImcompatibleVersions, node\_modules will also go to Babel after compilation, it is meaningless, no configuration
* Modify the history format to `{ type, options }`, the string format is no longer supported
* Modify the name of lessLoaderOptions to lessLoader
* Delete minimizer, only keep terserjs
* To modify the format of plugins to a string, you need to make sure that the dependent plugin is upgraded to Umi 3, and then refer to the modification method of umi-plugin-react above
* Delete sass, no longer support, follow-up will be provided as a plug-in
* Delete treeShaking, already built-in, no need to configure
* Delete tsConfigFile, no need
* Delete typescript, after TypeScript compilation is handed over to babel, the previous configuration of ts-loader is meaningless
* Delete uglifyJSOptions, no need
* Delete urlLoaderExcludes, no need

## Environment variable layer

## Code layer

### import all from umi

The interface of ʻumi/xxx` is no longer retained, all are imported from umi.

such as:

```diff
- import Link from 'umi/link';
+ import { Link } from 'umi';
```

### umi/router

Use `history` instead.

```diff
- import router from 'umi/router';
+ import { history } from 'umi';

- router.push('/foo');
+ history.push('/foo');
```

### Reference aliases or third-party libraries in CSS

Need to add `~` prefix.

such as:

```diff
# 别名
- background: url(@/assets/logo.png);
+ background: url(~@/assets/logo.png);

# 三方库
- @import url(foo/bar.css);
+ @import url(~foo/bar.css);
```

## Encounter problems

Umi v3 has made a lot of detailed improvements and reconstructions. We have collected all known incompatible changes and related impacts as much as possible, but there may still be some scenarios that we have not considered. If you encounter problems during the upgrade process, please go to [Github issues](https://github.com/umijs/umi/issues) for feedback. We will respond as soon as possible and improve this document accordingly.

You can also add the "Umi 3 upgrade problem mutual help and mutual assistance" group,

<img src="https://img.alicdn.com/tfs/TB1KOhYk8FR4u4jSZFPXXanzFXa-547-550.png" width="60" />

Scan the QR code above and reply **umi 3**.
