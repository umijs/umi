# Introduce

It's based on routing, supports [next.js-like conventional routing](https://umijs.org/guide/router.html), and various advanced routing functions, such as [routing-level on-demand loading](https://umijs.org/en/plugin/umi-plugin-react.html#dynamicimport). Then with a complete [plugin system](https://umijs.org/plugin/), covering every life cycle from source code to build product, umi is able to support various functional extensions and business needs, currently umi have almost 50+ plugins in both community and inside company.

umi is the basic front-end framework of [Ant Financial](https://www.antfin.com/), and has served 600+ applications directly or indirectly, including java, node, mobile app, Hybrid app, pure front-end assets app, CMS app, and more. umi has served our internal users very well and hopes that he can also serve external users well.

## Features

* 📦 **Out of box**，built-in react、react-router, etc
* 🏈 **Next.js like and [full featured](./router.html) routing conventions**, also support configured routing
* 🎉 **Complete plugin system**, covering every lifecycle from source code to production
* 🚀 **High performance**, support PWA, route level code splitting, etc via plugin
* 💈 **Support static export**, , adapt to various environments, such as console app, mobile app, [egg](https://github.com/eggjs/egg), Alipay wallet, etc
* 🚄 **Fast dev startup**, support enable [dll](../plugin/umi-plugin-react.html#dll) and [hard-source-webpack-plugin](../plugin/umi-plugin-react.html#hardSource) with config
* 🐠 **Compatible IE9**, based on [umi-plugin-polyfills](../plugin/umi-plugin-react.html#polyfills)
* 🍁 **Support TypeScript**, including d.ts definition and `umi test`
* 🌴 **Deep integration with [dva](https://dvajs.com/)**, support duck directory, automatic loading of model, code splitting, etc

## Architecture

The figure below is the architecture of umi.

<img src="https://gw.alipayobjects.com/zos/rmsportal/zvfEXesXdgTzWYZCuHLe.png" />

## Why not...?

### next.js

The routing of next.js is relatively simple. For example, his routing configuration does not support some advanced usages such as layout, nested routing, permission routing, etc., which are common in enterprise applications. Compared to next.js, umi is more like nuxt.js at the functional level of contracted routing.

