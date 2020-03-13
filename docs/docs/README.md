---
title: Introduce
nav:
  title: Docs
  order: 1
toc: content
---

<img src="https://img.alicdn.com/tfs/TB1zomHwxv1gK0jSZFFXXb0sXXa-200-200.png" width="120" />

## What is Umi?

Umi, Chinese can be pronounced Umi , a scalable enterprise-class front-end application framework. Umi is based on routing, and supports both configuration routing and contracted routing to ensure the completeness of routing functions and to expand its functions. It is then complemented with a complete plug-in system for the life cycle, covering every life cycle from source code to build products, supporting various function extensions and business requirements.

Umi is the underlying front-end framework of Ant Financial, and has directly or indirectly served 3000+ applications, including java, node, H5 wireless, offline (hybrid) applications, pure front-end assets applications, CMS applications, etc. He has served our internal users well, and hopes that he can also serve external users.

It mainly has the following functions:

* 🎉 *extensible* Umi has realized the complete life cycle and made it plug-in. Umi's internal functions are also completed by plug-ins. Plug-ins and plug-in sets are also supported to meet the hierarchical needs of functionality and vertical domains.
* 📦 *Out of the box* Umi has built-in routing, building, deployment, testing, and so on, and requires only one dependency to get started. It also provides an integrated plug-in set for React with rich content, which can meet 80% of the daily development needs.
* 🐠 *Enterprise level* Umi has been verified by Ant's internal 3000+ projects and company projects such as Ali, Youku, Netease, Flying Pig, Word of Mouth and so on.
* 🚀 *Based on research* including micro-front end, component packaging, documentation tools, request library, hooks library, data flow, etc., to meet the peripheral needs of daily projects.
* 🌴 *Complete routing* which supports both configuration routing and convention routing, while maintaining functional completeness, such as dynamic routing, nested routing, permission routing, and so on.
* 🚄 *Facing the future* while meeting the needs, we will not stop exploring new technologies. Such as dll speedup, modern mode, webpack @ 5, automated external, bundler less and so on.

## When is umi not used?

If you,

* Require a browser that supports IE 8 or lower
* Need to support React < 16.8
* Need to run Node < 10
* Require a lot of webpack customization
* Need to use a different routing scheme

Then Umi may not be right for you.

## Why not?

### [create-react-app](https://github.com/facebook/create-react-app)

`create-create-app` is a webpack-based packaging layer solution that includes build, dev, lint, etc. He has achieved the ultimate experience in the packaging layer, but does not include routing, is not a framework, and does not support configuration. Therefore, if you want to modify some configurations based on him, or you want to do technical convergence outside the packaging layer, you will encounter difficulties.

### [next.js](https://github.com/zeit/next.js)

`next.js` is a good choice. Many of Umi's functions are made by referring to `next.js`. To say that there are some places that are not as good as Umi, I think it may not be close enough to the business and not grounded enough. For example, the deep integration of antd and dva, such as internationalization, permissions, data flow, configurable routing, patch schemes, external aspects of automation, etc. will only be encountered by front-line developers.
