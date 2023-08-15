# Introduction to Umi

<br />
<img src="https://img.alicdn.com/imgextra/i3/O1CN01eBiy611b67KLFOxi3_!!6000000003415-2-tps-200-200.png" width="120" />

## What is Umi?

Umi, from the Chinese word 乌米 "woo-mee" (wū mǐ), is a scalable enterprise-class front-end application framework. Umi is based on routing, and supports both configuration routing and convention routing to ensure complete routing function experience. It is also complemented with a complete life cycle plug-in system, covering every use case from source code to build products, and supports many function extensions and business requirements.

Umi is the underlying front-end framework of Ant Group, and has directly or indirectly served 10,000 applications, including Java, Node.js, mobile (H5), offline (Hybrid) apps, pure frontend asset applications, CMS applications, Electron apps, and Serverless applications. It has effectively served internal users within Ant Group and a significant number of external users from various companies such as Taobao, Fliggy, Alibaba Cloud, ByteDance, Tencent, Koubei, and Meituan. In ByteDance's [2021 developer survey report](https://zhuanlan.zhihu.com/p/403206195), Umi was the choice of 25.33% of developers.

Umi boasts several interesting features:

1. **Enterprise-Grade**: Focused on security, stability, best practices, and constraint capabilities.
2. **Plugin-Based**: Highly customizable with Umi itself built upon a plugin architecture.
3. **MFSU**: A Webpack bundling solution faster than Vite.
4. Complete routing based on React Router 6.
5. Fastest default request setup.
6. SSR & SSG capabilities.
7. Stable and performant ESLint and Jest integration.
8. Framework-level integration with React 18.
9. Monorepo best practices.
...

## When Not to Use Umi?

Umi might not be suitable for your project if:

1. You need to support browsers, including IE 8 or lower.
2. You need to support React versions earlier than 16.8.0.
3. Your project needs to run in an environment with Node.js versions lower than 14.
4. You have specific and strong Webpack customization requirements and preferences.
5. You need to choose a different routing solution.
...

## Why Not?

### create-react-app

create-react-app is a scaffolding tool and is not in the same category as Umi, next.js, remix, ice, modern.js, and similar frameworks. Scaffolding tools allow quick project setup, suitable for individual projects but insufficient for team use. Once a scaffolding is set up, it becomes difficult to iterate. Additionally, the encapsulation and abstraction provided by scaffolding tools are limited.

### next.js

For SSR (Server-Side Rendering), next.js is an excellent choice (though Umi also supports SSR). If you're only doing CSR (Client-Side Rendering), Umi might be a better option. Umi offers better extensibility, more user-friendly features such as configuration-based routing, patching solutions, integration with antd, micro-frontends, internationalization, permissions, and more. Umi is also more stable, as it locks all possible dependencies, updates them periodically, and won't break after reinstalling dependencies.

### Remix

I like Remix a lot, and Umi 4 has learned quite a bit from it. However, Remix is primarily a server framework, with its built-in loaders and actions running on the server side, which makes specific deployment environments necessary. Umi utilizes loaders, actions, and Remix's request mechanisms on both the client and server sides, achieving fast server requests and even faster requests for purely CSR projects. Additionally, Remix uses esbuild for bundling, which might not be suitable for projects with strict compatibility requirements or large dependency sizes.