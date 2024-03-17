---
order: 1
toc: content
translated_at: '2024-03-17T09:52:32.853Z'
---

# Introduction to Umi

<br />
<img src="https://img.alicdn.com/imgextra/i3/O1CN01eBiy611b67KLFOxi3_!!6000000003415-2-tps-200-200.png" width="120" />

## What is Umi?

Umi, pronounced as "Wu Mi" in Chinese, is an extensible enterprise-level front-end application framework. Umi is based on routing, supporting both configuration-based routing and convention-based routing, ensuring the completeness of routing features and further extending functionalities based on this. Accompanied by a plugin system with a complete lifecycle, it covers every lifecycle from the source code to the build product, supporting various functional extensions and business needs.

Umi is the underlying front-end framework of Ant Group, serving directly or indirectly over 10,000 applications, including Java, Node, H5 Wireless, Hybrid applications, pure front-end assets applications, CMS applications, Electron applications, Serverless applications, and more. It has served our internal users well and many external users, including Taobao system, Feizhu, Alibaba Cloud, ByteDance, Tencent, Koubei, Meituan, etc. In ByteDance's [research report](https://zhuanlan.zhihu.com/p/403206195) in 2021, Umi was the choice of 25.33% of developers.

Umi has many interesting features, such as:

1. **Enterprise-level**, considering more in terms of security, stability, best practices, and constraint ability<br />
2. **Plugin-based**, everything can be modified, and Umi itself is also composed of plugins<br />
3. **MFSU**, a Webpack packaging solution faster than Vite<br />
4. Complete routing based on React Router 6<br />
5. The fastest request by default<br />
6. SSR & SSG<br />
7. Stable white-box performance with ESLint and Jest<br />
8. Framework-level integration of React 18<br />
9. Best practices for Monorepo<br />
...

## When Not to Use Umi?

If your project,

1. Needs to support IE 8 or lower browsers<br />
2. Needs to support React versions below 16.8.0<br />
3. Needs to run in environments below Node 14<br />
4. Has strong webpack customization needs and subjective willingness<br />
5. Needs to choose different routing solutions<br />
...

Umi might not be suitable for you.


## Why Not?

### create-react-app

create-react-app is a scaffolding tool and not the same type as meta frameworks like Umi, next.js, remix, ice, modern.js, etc. Scaffolding can quickly start a project, which is sufficient for individual projects, but not enough for teams. Because using scaffolding is like spilt water; once it starts, it cannot iterate. Meanwhile, the encapsulation and abstraction that scaffolding can do are very limited.

### next.js

If SSR is needed, next.js is a very good choice (of course, Umi also supports SSR); but if only CSR is needed, Umi would be a better choice. By comparison, Umi has better extensibility; and Umi offers many more down-to-earth features, such as configuration-based routing, patch scheme, integration of antd, micro frontends, internationalization, permissions, etc.; at the same time, Umi is more stable, because it locks all dependencies that can be locked and proactively updates regularly. A certain subversion of Umi will not fail to run due to reinstallation of dependencies.

### remix

Remix is a framework I really like, and Umi 4 has <strike>copied</strike> (learned) a lot from it. But Remix is a Server framework, its built-in loaders and actions run on the server side, so it requires certain deployment environments. Umi applies loaders, actions, and the request mechanism of Remix to both the client and server side, not only making server requests fast but also achieving theoretically fastest values for pure CSR projects. At the same time, Remix is based on esbuild for packaging, which may not be suitable for projects with compatibility requirements or especially large dependencies.
