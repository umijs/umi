---
sidebarDepth: 2
---

# Component Library

## Why

The development of the component library requires a lot of cumbersome configuration to build the development environment, generate document stations, package deployment. At the same time, because the javascript technology stack iterates too fast, it takes a lot of learning and selection to develop a package that is at least not outdated.

Therefore, in order to solve this pain point, we have summarized the accumulated experience and the results of the exploration, and developed this plug-in, which is designed to facilitate more developers to develop component libraries. If you are inconvenienced in use, please feel free to [issue](https://github.com/umijs/umi-plugin-library/issues). 🤓

In addition, the component library mentioned here contains not only a react component library like antd, but also a tool library like umi-request.

## Features

- ✔︎ Provide out-of-the-box components and libraries to develop scaffolding
- ✔︎ Based on docz + umi, provide a component development environment that can be quickly started
- ✔︎ Support mdx syntax, you can write jsx in markdown, you can easily organize component demo and API documentation
- ✔︎ Packing is based on rollup, focusing on the packaging of components and libraries. Good tree-shaking features can make your package smaller and support on-demand loading without plugins.
- ✔︎ Supports cjs, esm, umd formats, so that your package can be applied to various application scenarios.
- ✔︎ cjs and esm formats support rollup and babel packaging
- ✔︎ Support lerna multi-package management mode, allowing sub-packages to be released independently
- ✔︎ Support for TypeScript

## Use

```bash
$ # Create directory
$ mkdir my-lib && cd my-lib

# Initialize scaffolding, select library
$ yarn create umi

# Installation dependency
$ yarn install

# Develop
$ umi doc dev

# Package
$ umi lib build [--watch]

# Package document
$ umi doc build

# Deploy the documentation to username.github.io/repo
$ umi doc deploy
```

## Configuration

Config it in `.umirc.js` or `config/config.js`,

```js
export default {
  plugins: [
      ['umi-plugin-library', {}]
  ],
};
```

## [Configuration Parameters](/config/#component-library)

## Tutorial

- [Develop a component library](/guide/library-step-by-step.html)

## Common problem

### Using Typescript

`umi-plugin-library` will check if there is a `tsconfig.json` under the project, and automatic identification does not require additional configuration.

It is recommended that developers use `Typescript`, which can be easily generated automatically with `PropsTable`.

```js
import { Playground, PropsTable } from 'docz'
import Button from './'

# Button

<PropsTable of={Button} />
```

### Mdx Problem

#### [Syntax](https://mdxjs.com/syntax)

#### How to use variables

In some scenarios, you need to define variables, not directly `const hello = 123`, which needs to be done in the following ways:

- Add `export` when defining, such as `export const hello = 123`.
- Extract the component demo code into a file such as `demo.jsx`, introduce it and render it directly, and the sample code can be displayed in markdown mode.
- Render components using function in `Playground`.

```jsx
<Playground>
  {
    () => {
      Const hello = 123;
      Return <div>{hello}</div>;
    }
  }
</Playground>
```

#### How to use state

If the sample component needs to use state, you need to extract the code into a file such as `demo.jsx`, introduce it and render it, and the sample code can be displayed in markdown.

### Monorepo

If you use `lerna` to manage subcontracting projects like `react`, `babel`, `umi`, `umi-plugin-library` will be automatically recognized by `lerna.json` under the project.

The root directory configuration will be applied to each package. If a package needs to be configured separately, you can create a new `.umirc.library.js` configuration difference in the package. Note that this configuration file uses the es5 syntax `module.exports = {}`.
