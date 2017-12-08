# Develop

## Opts for both dev and build

* cwd
* libraryName
* babel
* disableCSSModules
* extraResolveModules
* plugins
* routerTpl
* entryJSTpl
* staticDirectory, default `static`
* tmpDirectory, default `.${libraryName}`
* outputPath, default `./dist`

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

## Plugin

### Generate Entry

* generateEntry
 
### Generate HTML

* getConfigScript
* getTailBodyReplace
* generateHTML
 
### Build

* buildSuccess
