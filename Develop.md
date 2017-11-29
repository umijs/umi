# Develop

## Opts for both dev and build

* cwd
* libraryName
* babel
* enableCSSModules
* extraResolveModules
* plugins
* routerTpl
* entryJSTpl
* staticDirectory, default `static`

## dev

```js
require('umi/lib/dev')(opts);
```

Opts for dev only:

* extraMiddlewares

## build

```js
require('umi/lib/build')(opts);
```

Opts for build only:

* hash
