# Block

<Badge text="Support in 2.3.0+"/>

In umi, block is a code snippet. umi defines a block specification, you can develop your own block or use blocks from other sources. With umi you can quickly and easily add a umi block to your project for quick initialization of your code.

## Usage

Use the following command in the project root directory to add a block to your project:

```bash
$ umi block add [block url]  --path=[target path]
```

Where `[block url]` can be a Github or Gitlab address, a Git repository address, or a local relative or absolute path. Then umi can use this command to download the code which meets the specifications of the umi block to your project.

`[target path]` is the path you want to add the block to. If a route component already exists under this path, umi adds blocks to it. If not, umi creates a route component and then adds the block.

For example, you can run:

```bash
$ umi block add https://github.com/umijs/umi-blocks/tree/master/demo
```

to download demo blocks from the official block repo to your local project. For blocks under the [official block repo](https://github.com/umijs/umi-blocks) you can use a more shotcut command, such as `umi block add demo` to download.

If your project is on dev, after the block is downloaded into the project, you can access the added path to see the results. The block code will be downloaded to pages/[name] by default, where name is the `package.json` field in the default fetch block (the invalid fragment before '/' will be removed). For configuration routes, we also add route configuration to your configuration by default, so it's also accessible.

You can use `umi help block` look for more command config.

It should be noted that the block is only used to improve the efficiency of the new page during development. Generally speaking, the block needs to modify the final code according to the project requirements for practical application, and the maintenance will be maintained by the developer just like the ordinary page. There is no such thing as block update.

umi will use `block` config in `config.js`:

```js
block: {
  defaultGitUrl: 'https://github.com/ant-design/pro-blocks',
},
```

### transform TypeScript block to JavaScript

In the new release, TypeScript is being converted to JavaScript so that you can add `--js` parameters when downloading blocks. Examples are as follows:

```bash
npx umi block add DashboardAnalysis --js
```

### Use other package management tools

The block supports a custom package installation tool with parameters, npm by default, and we will use yarn if you have a `yarn.lock` file in your project. If you want to use cnpm or tnpm you can use the following command:

```bash
npx umi block add DashboardAnalysis --npm-client cnpm
```

In some cases, the official source of npm may be very slow to access, and block will switch between the official source and taobao source by default for keep the final speed. if you want to use custom sources like this

```bash
npx umi block add DashboardAnalysis  --registry myregistryUrl
```

## Block Development

### Init Block

You can use [create-umi](https://github.com/umijs/create-umi) to quickly create a block template:

```bash
$ yarn create umi --block
```

The directory structure of the block is as follows:

```
- root
  - src              // block code
    - index.js       // block entry, need export a React component
    - _mock.js       // mock file
  - package.json     // block config in it
  - .umirc.js        // for block development
  - thumb.[png|jpg]  // thumb
```

config in package.json：

```js
{
  name: '@umi-blocks/demo',
  description: '区块描述',
  // ... more npm package.json config
  dependencies: {
    // block dependencies
    antd: '^3.0.0',
  },
  devDependencies: {
    // dev dependencies
  },
  scripts: {
    // for dev script
  }
}
```

### Block add logic

When you excute `umi block add [block url]` in your project, it will do:

- git clone or git pull block repo code
- check and install dependencies in package.json
- copy block code to you project
- add route config if your project use configuration Routing

### Macros replace

To avoid conflicts between blocks added to the application, umi provides macros that are replaced in the block code with information corresponding to the block when the block is added to the project. With this capability, problems like namespace collision of dva model can be avoided.

macros demo based on `--path=/Test_Hello/hello-Block`:

- ROUTE_PATH `/test_hello/hello-block`
- BLOCK_NAME `test_hello-hello-block`
- PAGE_NAME `hello-block`
- PAGE_NAME_UPPER_CAMEL_CASE `HelloBlock`
- BLOCK_NAME_CAMEL_CASE `testHelloHelloBlock`

### Block Configuration

In block `package.json`, you can add some configuration to specify some special logic, it is not required.

The sample of config:

```json
{
  "name": "youblockname",
  "blockConfig": {
    // specification version, default is 1
    "specVersion": "0.1",
    // block dependencies
    "dependencies": ["path/to/subBlock1", "path/to/SubBlock2"]
  },
  "dependencies": {
    // package dependencies
    "antd": "^3.0.0"
  }
}
```

You can refer to umi official [demo-with-dependencies](https://github.com/umijs/umi-blocks/tree/master/demo-with-dependencies) to learn more.

### Block debugging

Block debugging based on [umi-plugin-block-dev](https://github.com/umijs/umi-plugin-block-dev):

```js
export default {
  plugins: [
    [
      'umi-plugin-block-dev',
      {
        layout: 'ant-design-pro',
      },
    ],
  ],
};
```

If you feel that the quality of the block is good, you can submit PR to add it to the [official blocks repo](https://github.com/umijs/umi-blocks).
