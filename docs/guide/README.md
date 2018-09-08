# Introduction

umi is a routing-based framework that supports [next.js-like conventional routing](https://umijs.org/guide/router.html) and various advanced routing functions, such as [routing-level on-demand loading](https://umijs.org/en/plugin/umi-plugin-react.html#dynamicimport). With a complete [plugin system](https://umijs.org/plugin/) that covers every life cycle from source code to build product, umi is able to support various functional extensions and business needs. Currently umi has almost 50+ plugins in both community and inside company.

umi is the basic front-end framework of [Ant Financial](https://www.antfin.com/), and has served 600+ applications directly or indirectly, including Java, node, mobile apps, Hybrid apps, pure front-end assets apps, CMS apps, and more. umi has served our internal users very well and we hope that it can also serve external users well.

## Features

* 📦 **Out of box**, with built-in support for react, react-router, etc.
* 🏈 **Next.js like and [full featured](./router.html) routing conventions**, which also supports configured routing
* 🎉 **Complete plugin system**, covering every lifecycle from source code to production
* 🚀 **High performance**, with support for PWA, route-level code splitting, etc. via plugins
* 💈 **Support for static export**, adapt to various environments, such as console app, mobile app, [egg](https://github.com/eggjs/egg), Alipay wallet, etc
* 🚄 **Fast dev startup**, support enable [dll](../plugin/umi-plugin-react.html#dll) and [hard-source-webpack-plugin](../plugin/umi-plugin-react.html#hardSource) with config
* 🐠 **Compatible with IE9**, based on [umi-plugin-polyfills](../plugin/umi-plugin-react.html#polyfills)
* 🍁 **Support TypeScript**, including d.ts definition and `umi test`
* 🌴 **Deep integration with [dva](https://dvajs.com/)**, support duck directory, automatic loading of model, code splitting, etc

## Architecture

The figure below is the architecture of umi.

<img src="https://gw.alipayobjects.com/zos/rmsportal/zvfEXesXdgTzWYZCuHLe.png" />

## Why not...?

### next.js

The routing of next.js is relatively simple. For example, its routing configuration does not support some advanced usages such as layout, nested routing, permission routing, etc., which are common in enterprise applications. Compared to next.js, umi is more like nuxt.js at the functional level of contracted routing.

