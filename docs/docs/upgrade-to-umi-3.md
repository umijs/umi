---
translateHelp: true
---

# Upgrade to Umi 3


This document will help you upgrade from Umi 2.x to Umi 3.x.

## package.json

Change the version of `umi` to` ^ 3.0.0` or above.

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

In order to have a better ts prompt, you need to configure `@@` as `[" src / .umi / * "]`.

```diff
+ "@@/*": ["src/.umi/*"]
```

## Upgrade umi-plugin-react to @umijs/preset-react

If you have used `umi-plugin-react` before, here are the modification steps.

First modify the dependencies in package.json,

```diff
{
  "devDependencies": {
-   "umi-plugin-react": "^1"
+   "@umijs/preset-react": "^1"
  }
}
```

Then, because the configuration of Umi 3 is flat, you need to modify the configuration.

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

1. No need to register plugins repeatedly, Umi 3 will automatically register Umi plugins in dependencies
2. Extract the configuration to the outside

Functional change,

* Routes, library, dll, hardSource, pwa, hd, fastClick, chunks have been deleted and can no longer be used
* Built-in dynamicImport, title, scripts, headScripts, metas and links into Umi, you can continue to use
* Other functions are unchanged

## Configuration layer

Umi 3 has made a lot of streamlining in the configuration layer. The following modifications are sorted alphabetically for easy searching.

* Delete browserslist, duplicate targets
* Remove babel, basically no need
* Modify cssLoaderOptions as cssLoader
* Remove cssLoaderVersion and keep only css-loader @ 2
* Remove cssPublicPath. The relative path `./` For resource files referenced by css can meet all scenarios, no need to configure
* Remove disableGlobalVariables, there are always no global variables, no configuration required
* Remove disableRedirectHoist and never do redirect hoist
* Remove disableCSSModules and cssModulesWithAffix, Umi 3 automatically recognizes the use of css modules without configuration
* Remove extraBabelIncludes and es5ImcompatibleVersions, node\_modules is also meaningless after compiling with babel, no configuration required
* Change the history format to `{type, options}`, no longer support string format
* Modify lessLoaderOptions as lessLoader
* Remove minimizer, keep only terserjs
* Modify the format of plugins as a string. You need to ensure that the dependent plugins are upgraded to Umi 3 first, and then refer to the previous umi-plugin-react modification
* Remove sass, no longer supported, will be provided as a plugin in the future
* Remove treeShaking, built-in, no configuration required
* Delete tsConfigFile, no need
* Removed typescript, after the TypeScript compilation was handed over to babel, the previous configuration of ts-loader would be meaningless
* Remove uglifyJSOptions, no need
* Remove urlLoaderExcludes, no need

## Environment variable layer

## Code layer

### import all from umi

The interface of `umi/xxx` is no longer retained, and all are imported from umi.

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

Need to be prefixed with `~`.

such as:

```diff
# Alias
- background: url(@/assets/logo.png);
+ background: url(~@/assets/logo.png);

# Third party library
- @import url(foo/bar.css');
- @import url(~foo/bar.css');
```

## Encounter problems

Umi v3 has made many detailed improvements and refactorings. We collected all known incompatible changes and related impacts as much as possible, but there may be some scenarios we have not considered. If you encounter problems during the upgrade, please go to [Github issues](https://github.com/umijs/umi/issues) Give feedback. We will respond and improve this document as soon as possible.

You can also add the "Umi 3 upgrade issues to help each other" group,

<img src="https://img.alicdn.com/tfs/TB1pd1ce8r0gK0jSZFnXXbRRXXa-430-430.jpg" width="60" />

Scan the QR code above and reply **umi 3**。
