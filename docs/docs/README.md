---
title: Introduce
nav:
  title: Docs
  order: 1
toc: content
---

<img src="https://img.alicdn.com/tfs/TB1zomHwxv1gK0jSZFFXXb0sXXa-200-200.png" width="120" />

## What is Umi?

Umi, from the Chinese word **乌米** , is a scalable enterprise-class front-end application framework. Umi is based on routing, and supports both configuration routing and convention routing to ensure complete routing function experience. It is also complemented with a complete life cycle plug-in system, covering every use case from source code to build products, and supports many function extensions and business requirements.

Umi is the underlying front-end framework of Ant Financial, and has directly or indirectly served 3000+ applications, including java, node, H5 wireless, offline (hybrid) applications, pure front-end assets applications, CMS applications, etc. It has served our internal users well, and we hope that it can also serve external users.

Umi mainly serves the following functions:

- 🎉 _Extensible_ Umi has realized the complete life cycle and made it extendable via plug-ins. Umi's internal functions are also extendable via plug-ins. Plug-ins and plug-in sets are also supported to meet the hierarchical needs of functionality and vertical domains.
- 📦 _Out of the box_ Umi has built-in routing, building, deployment, testing, and so on, and requires only one dependency to get started. It also provides an integrated plug-in set for React with rich content, which can meet 80% of the daily development needs.
- 🐠 _Enterprise level_ Umi has been verified by Ant's internal 3000+ projects and company projects such as Ali, Youku, Netease, Flying Pig, Word of Mouth and so on.
- 🚀 _Based on research_ including micro-front end, component packaging, documentation tools, request library, hooks library, data flow, etc., to meet the peripheral needs of daily projects.
- 🌴 _Complete routing_ which supports both configuration routing and convention routing, while maintaining functional completeness, such as dynamic routing, nested routing, permission routing, and so on.
- 🚄 _Forward looking_ while meeting the current needs of today, Umi will not stop exploring new technologies to meet the needs of tomorrow as well. This will include things such as dll speedup, modern mode, webpack @ 5, automated external, bundler less and much more.

## When should umi not be used?

If you:

- Require a browser support for IE 8 or lower
- Need to support React < 16.8
- Need to run Node < 10
- Require a lot of webpack customization
- Need to use a different routing scheme

Then Umi may not be right for you.

## Why use umi over these other tools and frameworks?

### [create-react-app](https://github.com/facebook/create-react-app)

`create-react-app` is a webpack-based packaging layer solution that includes build, dev, lint, etc. While it is a great packaging layer solution, it does not include support for routing, is not a framework, and does not support configuration. Therefore, if you want to modify some configurations based on it, or if you want to do technical convergence outside the packaging layer, you will encounter difficulties.

### [next.js](https://github.com/zeit/next.js)

On the whole, `next.js` is a good choice; in fact, many of Umi's functions were inspired by `next.js`. There are a few places, however, that we feel `next.js` is not as good as Umi, such as not being grounded to the needs of enterprise applications and businesses. For example, Umi, with the deep integration of antd and dva, along with the support for features such as internationalization, permissions, data flow, configurable routing, patch schemes, external aspects of automation, etc, includes many things out of the box that will be frequently encountered by front-end developers.
