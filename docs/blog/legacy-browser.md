# Non-Modern Browser Compatibility

## Default Compatibility Explanation

Umi 4 does not support IE by default. The compilation compatibility target `targets` is set to `chrome: 80`. If you need to adjust this, specify explicit [targets](../docs/api/config#targets):

```ts
// .umirc.ts

export default {
  targets: { chrome: 67 }
}
```

If you want to provide feedback or participate in discussions about compatibility, please visit: [issue / 8656](https://github.com/umijs/umi/issues/8658)

## Compatibility with Non-Modern Browsers

If you don't need to support IE but want to enhance your project's compatibility with non-modern browsers, you can adjust the compatibility [targets](../docs/api/config#targets).

By default, Umi 4 uses modern build tools and generates output to `es6`. If you want to generate output in `es5`, adjust the configuration:

```ts
// .umirc.ts

export default {
  jsMinifier: 'terser',
  cssMinifier: 'cssnano'
}
```

## Compatibility with Older Browsers (IE 11)

Since IE is no longer mainstream, if you need to support IE, consider the following strategies.

### Framework's Built-In Legacy Mode

Umi 4 provides a built-in `legacy` configuration for downgrading (for usage limitations, see [legacy](../docs/api/config#legacy)):

```ts
// .umirc.ts

export default {
  legacy: {}
}
```

By default, it only takes effect during the build and attempts to generate compatible output for IE.

### More Customization for Legacy Mode

When `legacy` is enabled, it will transpile all `node_modules`. However, transpiling `node_modules` can significantly increase build time in large projects.

If you know which third-party dependencies your project uses (those no longer provide `es5` output), you can disable the `node_modules` transformation and use [`extraBabelIncludes`](https://umijs.org/docs/api/config#extrababelincludes) to specifically configure packages that need extra transformation.

An example:

```ts
// .umirc.ts

export default {
  legacy: {
    nodeModulesTransform: false
  },
  extraBabelIncludes: [
    'some-es6-pkg',
    /@scope\//
  ]
}
```

### Enhancing Compatibility Robustness

The `legacy` option cannot guarantee 100% that the output will run smoothly on deprecated browsers. You may need to add a **pre-pended** full polyfill to enhance the project's [robustness](https://en.wikipedia.org/wiki/Robustness).

```ts
// .umirc.ts

export default {
  headScripts: [
    'http://polyfill.alicdn.com/v3/polyfill.min.js' // or https://polyfill.io/v3/polyfill.min.js
  ],
  legacy: {}
}
```

Consider these approaches:

Approach | Explanation
:-|:-
CDN Import | Import polyfill js files that the target browser environment lacks as **script tags that are pre-pended**, such as [es6-shim](https://github.com/paulmillr/es6-shim).
Manual core-js | Use tools from the [core-js](https://github.com/zloirock/core-js) family, such as building your own required polyfill output using [core-js-builder](https://github.com/zloirock/core-js/tree/master/packages/core-js-builder), and then include it in your project using a **pre-pended script tag**.
Dynamic Polyfill Service | Use a service that dynamically serves the required polyfills based on the browser's User-Agent (UA) string. For example, [polyfill.io](https://polyfill.io/v3/polyfill.min.js) is a popular option. You can also self-host a similar dynamic polyfill service using [polyfill-service](https://github.com/Financial-Times/polyfill-service).

Note:

1. If you are in a development environment with internal network isolation, consider bringing in all polyfill js content into the internal network and using it on an internal CDN or placing it in the `public` directory.

2. The significance of using pre-pended script tags is to prepare a fully polyfilled environment before the project's JS resources run.

## Verifying in the Development Environment

The recommended approach is to build the project and locally verify the IE 11 compatibility by using [`umi preview`](../docs/api/commands#preview), [`serve`](https://www.npmjs.com/package/serve), or nginx to start a local server.

When you need to verify in the development environment:

1. Set `legacy.buildOnly` to `false`.

2. Due to React Fresh, HMR, and other ES6 code injected during development, you need to add a pre-pended polyfill as a script tag to prepare the environment before the project's JS resources run.

```ts
// .umirc.ts

const isProd = process.env.NODE_ENV === 'production'
export default {
  legacy: {
    buildOnly: false
  },
  headScripts: isProd 
    ? [] 
    : ['http://polyfill.alicdn.com/v3/polyfill.min.js']
}
```

Note: IE 11 does not fully support hot updates during development, and the cache might need to be manually cleared in the console to see the latest version of the page. Please be prepared for this.