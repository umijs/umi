# Develop a component library

## Preparing the environment

> If you want to get started quickly, you can also use our [scaffolding](https://github.com/umijs/create-umi) directly

Initialization project

```bash
# Create a directory
$ mkdir umi-library-demo && cd umi-library-demo

# Initialization
$ yarn init -y

#Installation dependency
$ yarn add umi umi-plugin-library --save-dev
```

Add configuration file `.umirc.js`

```js
export default {
    Plugins: [
        'umi-plugin-library'
    ]
}
```

Add script to `package.json`:

```diff
+ "scripts": {
+ "doc:dev": "umi doc dev"
+ },
```

At this point, you can already run through the following commands:

```bash
$ yarn run doc: dev
```

The browser accesses `http://127.0.0.1:8001/`, and you can see our component development environment.

## Development component

Plan the directory structure, the entry is `src/index.js`, `Foo` is our first component

```bash
.
├── .umirc.js # Configuration
├── package.json
└── src
    ├── Foo # Component
    │ └── index.js
    └── index.js # entry
```

The `Foo` component code is as follows:

```js
// src/Foo/index.js
import * as React from 'react';

export default function(props) {
  return (
    <button
      style={{
        fontSize: props.size === 'large' ? 40 : 20,
      }}
    >
      { props.children }
    </button>
  );
}
```

Next, run our component and create `index.mdx` in the `src/Foo` directory. Based on `mdx`, you can use `markdown` plus `jsx` syntax to organize the document.

```markdown
---
name: Foo
route: /
---

import { Playground } from 'docz';
import Foo from './';

# Foo Component

## Normal Foo

<Foo>Hi</Foo>

## Large Foo with playground

<Playground>
    <Foo size="large">Hi</Foo>
</Playground>
```

Look at our development environment, you can see the component effect
![Screenshot 2019-02-06 23.26.51](https://gitcdn.link/repo/clock157/cdn/master/images/blog_library_1.png)

## Component Testing

In order to ensure the quality of the components, we need to introduce component testing, the test solution can be used directly [umi-test](https://github.com/umijs/umi/tree/master/packages/umi-test)

```bash
$ yarn add umi-test --save-dev
```

Create a new test file in the `src/Foo` directory `index.test.js`

```js
import { shallow } from 'enzyme';
import Foo from './index.js';

describe('<Foo />', () => {
    it('render Foo', () => {
        const wrapper = shallow(<Foo size="large">hello, umi</Foo>);
        expect(wrapper.prop('style').fontSize).toEqual(40);
        expect(wrapper.children().text()).toEqual('hello, umi');
    });
});
```

Then add a test command in the `scripts` of `package.json`

```diff
  "scripts": {
    "doc:dev": "umi doc dev",
+   "test": "umi-test"
  },
```

Execute test command

```bash
$ yarn run test
```

Execution results, test passed!

```bash
 PASS  src/Foo/index.test.js
  <Foo />
    ✓ render Foo (39ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        11.701s
Ran all test suites.
✨  Done in 15.82s.
```

## Component Packaging

After the component development test is completed, it needs to be packaged into different products to suit different scenarios. By default, `rollup` is packaged to generate three formats:

- `cjs`: CommonJs, can be used by Node and packaging tools like webpack.
- `esm`: ES Module, support for static analysis can be tree shaking.
- `umd`: Universal Module Definition Universal package, can be used like `cjs`, can also be published to cdn, used by the browser by script. If there is no such requirement, you can use `umd: false` to close, avoid Most of the packaging problems.

Modify `package.json`

```diff
-  "main": "index.js",
+  "main": "dist/index.js",
+  "module": "dist/index.esm.js",
+  "unpkg": "dist/index.umd.js",
   "scripts": {
    "doc:dev": "umi doc dev",
+   "dev": "umi lib build --watch",
+   "build": "umi lib build",
    "test": "umi-test"
  },
```

Use command

```bash
# Monitoring file changes and packaging
$ yarn run dev

# build
$ yarn run build
```

Package result

```bash
yarn run v1.12.3
$ umi lib build
✔  success   [umi-library-demo] cjs: dist/index.js
✔  success   [umi-library-demo] esm: dist/index.esm.js
✔  success   [umi-library-demo] umd: dist/index.umd.development.js
✔  success   [umi-library-demo] umd: dist/index.umd.js
✨  Done in 33.38s.
```

## Verifying the product

In order to verify that our product is available, we can create a small demo based on umi and use it to create a directory `example` under the project.

```bash
example/
└── pages
    └── demo-foo
        └── index.js
```

We created the `demo-foo` page and used the `Foo` component with its `index.js` code:

```js
import { Foo } from '../../../dist';

export default function() {
    return (
        <Foo size="large">hello, world</Foo>
    );
}
```

Let's run our code

```bash
$ cd example
$ umi dev

# If there is no umi command, please install
$ yarn global add umi
```

After booting up, the console will prompt you to access the address. After opening it, visit the page `/demo-foo` and you will see the effect:
![Component Effects](https://user-images.githubusercontent.com/4002237/52470667-cf6da100-2bc9-11e9-910c-a29e43d1eca2.png)

## Publishing components

The components are developed, published to the npm registry and can be used by everyone, or published to the private registry. If you do not have an npm account, you need to register first, then log in to `yarn login`.

Modify `package.json`, add the release script, execute the test case before publishing, and the package only contains the dist directory:

```diff
+ "files": ["dist"],
   "scripts": {
+ "pub": "yarn run test && yarn publish",
     "test": "umi-test"
   },
```

Excuting an order

```bash
$ yarn run pub
```

After the release is successful, you can see [umi-library-demo](https://www.npmjs.com/package/umi-library-demo) at npm

For other users, you can use the following command to install and use this package.

```bash
# use yarn
$ yarn add umi-library-demo --save

# use npm
$ npm install umi-library-demo --save
```

## Publishing a document

After our components are developed and the documentation is written, we need to package and deploy the documentation for the user to view.

First modify `package.json`, add script:

```diff
  "scripts": {
  "doc:dev": "umi doc dev",
+ "doc:build": "umi doc build",
+ "doc:deploy": "umi doc deploy",
  },
```

Then execute the command:

```bash
#package document
$ yarn run doc:build

#Deploy the documentation, the speed depends on the speed of the network
$ yarn run doc:deploy
```

The document will be deployed to `github.io`, and the url rule is `https://{username}.github.io/{repo}`. Take this project as an example. The document address is:

[https://clock157.github.io/umi-library-demo/](https://clock157.github.io/umi-library-demo/)

## Conclusion

[example code](https://github.com/clock157/umi-library-demo)

At this point, the process of publishing a component library: build, develop, test, package, verify, publish, document, the whole process will go through, in the actual development process, you may encounter more problems, or you are against this If the tutorial does not understand, you can feedback us.

Dingtalk group

<img src="https://gw.alipayobjects.com/zos/rmsportal/jPXcQOlGLnylGMfrKdBz.jpg" width="120" />
