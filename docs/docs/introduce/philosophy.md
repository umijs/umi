# Design Philosophy

Umi has gone through iterations from version 1 to 4, trying out various ideas and approaches, both successful and unsuccessful. These successful elements have gradually been refined into guiding principles for creating a high-quality enterprise-level framework.

The design philosophy encompasses:

1. **Technology Convergence**
2. **Plugins and Plugin Collections**
3. **Best Practices**
4. **Enterprise-Grade**
5. **import all from umi**

The following will cover points 1 to 5, while points 6 to 9 were elaborated in detail during the SEE Conf on January 8, 2022, and can be found in the article [SEE Conf: Umi 4 Design Philosophy Transcript](https://mp.weixin.qq.com/s?__biz=MjM5NDgyODI4MQ%3D%3D&mid=2247484533&idx=1&sn=9b15a67b88ebc95476fce1798eb49146).

## Technology Convergence

<br />
<img src="https://img.alicdn.com/tfs/TB1hE8ywrr1gK0jSZFDXXb9yVXa-1227-620.png" width="600" />
<br />

Technology convergence is especially crucial for teams. It involves two aspects: 1) Technology stack convergence and 2) Dependency convergence. Technology stack convergence addresses the multitude of choices within various technology domains. For instance, there are over 100 choices for data flow, making it challenging for developers to choose the best option. After converging on a technology stack, it's necessary to converge on dependencies. In a team, projects should avoid having too many fragmented dependencies, as each one incurs upgrading costs.

The goal is for developers who depend on Umi to not worry about dependencies like babel, webpack, postcss, react, react-router, etc. Similarly, by depending on `@umijs/max`, developers need not concern themselves with dependencies and technology stacks when developing mid-tier projects.

## Plugins and Plugin Collections

<br />
<img src="https://img.alicdn.com/tfs/TB1mrhuwqL7gK0jSZFBXXXZZpXa-956-728.png" width="400" />
<br />

Umi provides a mechanism of plugins and plugin collections to cater to different scenarios and business requirements. Plugins extend specific functionalities, while plugin collections extend categories of business requirements. For instance, to support Vue, there could be `@umijs/preset-vue`, including build and runtime functionalities for Vue. Similarly, `@umijs/preset-h5` could bundle h5-related features together for supporting h5 applications.

Analogously, plugin collections resemble babel presets and eslint configs.

## Best Practices

Best practices reflect our current understanding of the best way to do something. Since the subject is "we," best practices are relatively subjective. Umi provides best practices for aspects like routing, patching solutions, data flow, requests, permissions, internationalization, micro-frontends, icon usage, editor usage, charts, forms, etc. Many of these practices are derived from practices and discussions within Ant Group, as well as from the community. These practices are subjective and time-sensitive, leading to frequent iterations.

Best practices are essential due to the overwhelming number of choices in the community and the lack of time, experience, or willingness of many developers to choose. Especially for non-professional developers, having a choice is better than not having one, regardless of the choice itself.

## Enterprise-Grade

The npm ecosystem is somewhat chaotic, with issues like politically sensitive packages, malicious packages, and job advertisement packages cropping up frequently. Ensuring that projects won't "break overnight" is an essential aspect of creating a framework meant to serve enterprises.

Umi tackles this by fixing versions, pre-bundling dependencies, locking eslint dependencies using eslint hacks, and locking babel patch dependencies through configuration. These strategies ensure that Umi won't break after reinstalling node_modules, contributing to its longevity.

## import all from umi

This feature might be unfamiliar to many. "import all from umi" means that all imports come from `umi`. For example, instead of `import { connect } from 'dva'`, it's `import { connect } from 'umi'`. The exported methods not only come from Umi itself but also from Umi plugins.

This feature was introduced in Umi 3 two years ago. Recently, similar implementations have been adopted by frameworks and tools like Remix, prisma, and vitekit.

```ts
// Many plugins provide additional exports from umi
import { connect, useModel, useIntl, useRequest, MicroApp, ... } from 'umi';
```

The benefit is that many dependencies are managed through Umi, reducing the need for manual installations. Additionally, developers will have fewer import statements in their code.