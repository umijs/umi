# Directory and Convention

In the organization of files and directories, umi tries to choose the agreed upon way.

The directory structure of a complex application is as follows:

```
.
├── dist/                           // default build output directory
├── mock/                           // The directory where the mock file is located, based on express
├── config/
    ├── config.js                   // umi configuration, same as .umirc.js, choose one
└── src/                            // source directory, optional
    ├──layouts/index.js             // global layout
    ├── pages/                      // page directory, the file inside is the route
        ├── .umi/                   // dev temp directory, need to be added to .gitignore
        ├── .umi-production/        // build temporary directory, will be deleted automatically
        ├── document.ejs            // HTML template
        ├── 404.js                  // 404 page
        ├── page1.js                // page 1, arbitrarily named, export react component
        ├── page1.test.js           // Use case file, umi test will match all files ending in .test.js and .e2e.js
        └── page2.js                // page 2, arbitrarily named
    ├── global.css                  // Conventional global style files, imported automatically, or global.less
    ├── global.js                   // can add polyfill here
├── .umirc.js                       // umi configuration, same as config/config.js, choose one
├── .env                            // environment variable
└── package.json
```

## ES6 Grammar

Configuration files, mock files, etc. are registered in real time with `@babel/register`, so you can use ES6 syntax and es modules just like files in src.

## dist

The default output path can be modified by configuring `outputPath`.

## mock

It is agreed that all `.js` files in the mock directory will be parsed as mock files.

For example, create a new `mock/users.js` with the following contents:

```js
export default {
  '/api/users': ['a', 'b'],
}
```

Then visit [http://localhost:8000/api/users](http://localhost:8000/api/users) in your browser to see `['a', 'b']`.

## src

By convention, `src` is the source directory. But optional, simple items can be added without the `src` directory.

For example: the effect of the following two directory structures is the same.

```
+ src
  + pages
    - index.js
  + layouts
    - index.js
- .umirc.js
```

```
+ pages
  - index.js
+ layouts
  - index.js
- .umirc.js
```

## src/layouts/index.js

The global layout is actually a layer outside the route.

For example, your route is:

```
[
  { path: '/', component: './pages/index' },
  { path: '/users', component: './pages/users' },
]
```

If there is `layouts/index.js`, then the route becomes:

```
[
  { path: '/', component: './layouts/index', routes: [
    { path: '/', component: './pages/index' },
    { path: '/users', component: './pages/users' },
  ] }
]
```

## src/pages

All the `(j|t)sx?` files under the pages are the routes. For more information on contracted routing, go to the Routing chapter.

## src/pages/404.js

404 page. Note that there is a 404 prompt page provided by the built-in umi in development mode, so you can access this page only by explicitly accessing `/404`.

## src/pages/document.ejs

When this file is available, it overrides the default HTML template. Needs to include at least the following code:

```html
<div id="root"></div>
```

## src/pages/.umi

This is a temporary directory produced by umi dev. It contains `umi.js` and `router.js` by default, and some plugins will generate some other temporary files here. You can do some validation here, **but please don't modify the code directly here, umi restart or file modification under pages will regenerate the files in this folder.**

## src/pages/.umi-production

Same as `src/pages/.umi`, but generated in `umi build`, it will be automatically deleted after `umi build`.

## .test.js and .e2e.js

The test file, `umi test` will find all the .(test|e2e).(j|t)s files to run the test.

## src/global.(j|t)sx?

At the beginning of the entry file is automatically introduced, you can consider adding polyfill here.

## src/global.(css|less|sass|scss)

This file does not go css modules, is automatically introduced, you can write some global styles, or do some style coverage.

## .umirc.js and config/config.js

Umi's configuration file, choose one.

## .env

Environment variables, such as:

```
CLEAR_CONSOLE=none
BROWSER=none
```
