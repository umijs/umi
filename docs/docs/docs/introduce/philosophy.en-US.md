---
order: 2
toc: content
translated_at: '2024-03-17T09:51:30.781Z'
---

# Design Philosophy

Umi has gone from 1 to 4, experimenting with many things, both successes and failures. We have gradually accumulated these successful experiences, guiding us on how to build a robust enterprise-level framework.

The design philosophy includes:

1. Technological Convergence
2. Plugins and Plugin Collections
3. Best Practices
4. Enterprise-Level
5. import all from umi
6. Compile-Time Framework
7. Dependency Prepacking
8. Fast by Default
9. Constraints and Openness

Below, we introduce the first five points, while the last four points (6-9) had a detailed share at the SEE Conf on January 8, 2022, see [SEE Conf: Umi 4 Design Philosophy Manuscript](https://mp.weixin.qq.com/s?__biz=MjM5NDgyODI4MQ%3D%3D&mid=2247484533&idx=1&sn=9b15a67b88ebc95476fce1798eb49146).

## Technological Convergence

<br />
<img src="https://img.alicdn.com/tfs/TB1hE8ywrr1gK0jSZFDXXb9yVXa-1227-620.png" width="600" />
<br />

Technological convergence is particularly important for teams, encompassing two meanings: 1) convergence of technology stacks and 2) convergence of dependencies. Convergence of technology stacks refers to the plethora of technology stacks available in the community, with numerous choices for each technical direction, such as data flows which alone could number over 100, and how developers should make their choice; After converging the technology stack, it's also necessary to converge dependencies, as the projects of developers within a team should not have many fragmented dependencies, each of which comes with an upgrading cost.

We hope that once developers depend on Umi, they no longer need to worry about dependencies like babel, webpack, postcss, react, react-router, etc., and by depending on @umijs/max, they need not be concerned with dependencies and technology stacks of developing mid-end projects.

## Plugins and Plugin Collections

<br />
<img src="https://img.alicdn.com/tfs/TB1mrhuwqL7gK0jSZFBXXXZZpXa-956-728.png" width="400" />
<br />

Umi satisfies different scenarios and business needs through the mechanism of plugins and plugin collections. A plugin is to extend a function, whereas a plugin collection is to extend a category of business. For example, to support vue, we could have `@umijs/preset-vue`, including build and runtime related to vue; to support the H5 application type, there could be `@umijs/preset-h5`, aggregating H5 related functionalities together.

As an analogy, plugin collections are similar to babel's presets and eslint's configs.

## Best Practices

Best practice is what we believe to be the best way to do something at the moment. The subject is us, so it could be relatively subjective. For instance, in aspects like routing, patch solutions, data flow, requests, permissions, internationalization, micro-frontends, icons usage, editor usage, charts, forms, etc., Umi will offer our best practices. Most of these practices come from internal practices and discussions at Ant Group, with some from the community. They are subjective and time-sensitive, so there might be relatively frequent iterations.

The need for best practices arises, 1) because there are too many solutions in the community to choose from, and 2) many people lack the energy, experience, or even willingness to make choices. Especially for non-professional front-end developers, having choices is better than having none, regardless of what those choices might be.

## Enterprise-Level

The npm community is "deteriorating" with political, malicious, advertisement, and job-seeking packages frequently appearing. Thus, how to ensure your project won’t “crash overnight” is an unavoidable issue for frameworks providing services to enterprises.

Umi achieves this by locking down versions, prepacking dependencies, hacking eslint to lock eslint's dependencies, and using configuration to lock down babel patch dependencies, so that Umi won't crash after you reinstall node_modules, aiming to be "Still Usable in Ten Years".

## import all from umi

Many may be hearing about this for the first time. import all from umi means all imports come from `umi`. For instance, dva is not `import { connect } from 'dva'`, but `import { connect } from 'umi'`, exported from Umi. The methods exported not only come from Umi itself but also from Umi plugins.

```ts
// A large number of plugins provide additional exports for umi
import { connect, useModel, useIntl, useRequest, MicroApp, ... } from 'umi';
```

The advantage is that Umi manages a large number of dependencies so users don’t need to manually install them; at the same time, developers will also have fewer import statements in their code.
