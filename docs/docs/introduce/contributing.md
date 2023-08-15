import { Message } from 'umi';

# Contributing to Umi

❤️ Love Umi and want to get involved? Thank you!

## Environment Setup

### Node.js and pnpm

Developing Umi requires Node.js 16+ and `pnpm` v8.

It's recommended to use [`nvm`](https://github.com/nvm-sh/nvm) to manage Node.js to avoid permission issues and switch between different Node.js versions. Windows users can use [`nvm-windows`](https://github.com/coreybutler/nvm-windows).

You can install `pnpm` following the instructions on the [official website](https://pnpm.io/installation).

### Clone the Project

```bash
$ git clone git@github.com:umijs/umi.git
$ cd umi
```

### Install Dependencies and Build

```bash
$ pnpm i && pnpm build
```

## Developing Umi

### Start the dev Command

The `dev` command is essential for local Umi development. It compiles TypeScript files under the `src` directory into the `dist` directory and watches for file changes, performing incremental compilation.

```bash
$ pnpm dev
```

If you find it slow, you can also run the `pnpm dev` command for specific packages, for example:

```bash
$ cd packages/umi
$ pnpm dev
```

### Running Examples

The `examples` directory contains various examples used for testing. Running examples is a common way to confirm that Umi's features are working correctly during development. Each example has a `dev` script, so you can enter the example directory and run `pnpm dev`.

```bash
$ cd examples/boilerplate
$ pnpm dev
```

For running in Vite mode, add the `--vite` parameter:

```bash
$ pnpm dev --vite
```

### Testing

Currently, running tests is quite fast, taking around 10 seconds to complete. It's recommended to run tests locally before making a pull request to reduce the round trip time.

```bash
$ pnpm test
...
Test Suites: 1 skipped, 43 passed, 43 of 44 total
Tests:       6 skipped, 167 passed, 173 total
Snapshots:   0 total
Time:        13.658 s
Ran all test suites.
```

If you only want to run specific test files, use `pnpm jest`, as `pnpm test` only enables the TurboRepo feature.

For example:

```bash
$ pnpm jest packages/plugin-docs/src/compiler.test.ts
```

## Contributing to Umi Documentation

Umi's documentation is built using Umi@4 and the `@umijs/plugin-docs` plugin. Essentially, it's a Umi project itself. Run the following command in the root directory to start developing Umi documentation:

```bash
# Install Umi documentation dependencies
$ pnpm doc:deps
# Start developing Umi documentation
# The initial start may take a while due to compilation. Please be patient.
$ pnpm doc:dev
```

Open the specified port to view the updated documentation content and the results of `@umijs/plugin-docs` plugin development.

### Writing Umi Documentation

Umi documentation is written in MDX format. MDX is an extension of Markdown that allows you to include JSX components when writing Umi documentation.

<Message type="success">
When writing **document** content, you can find available components in the `packages/plugin-docs/client/theme-doc/components` directory. When writing **blog** content, available components can be found in the `packages/plugin-docs/client/theme-blog/components` directory.
</Message>

Umi documentation's code highlighting is based on [`Rehype Pretty Code`](https://github.com/atomiks/rehype-pretty-code). For complete capabilities and usage instructions, refer to its [official documentation](https://rehype-pretty-code.netlify.app).

You can format existing Umi documentation in the repository using the following command:

```bash
$ pnpm format:docs
```

After formatting, it's recommended to **only commit the Umi documentation you've written or modified**. Different document contributors have different writing styles, and formatting might not preserve the originally intended style.

### Contributing to Umi Documentation Plugin Development

Open a new terminal and run the following command:

```bash
$ cd packages/plugin-docs
$ pnpm dev:css
```

Now, when you modify the `tailwind.css` file or modify TailwindCSS styles during development, it will automatically compile and generate the `tailwind.out.css` stylesheet file.

Umi will watch for changes in files under the `docs` and `packages/plugin-docs/client` directories, but not in the `packages/plugin-docs/src` directory.

<Message>
If you need to compile files in `packages/plugin-docs/src`, move to the `packages/plugin-docs` directory and execute the `pnpm build` command, then restart the development process.
</Message>

You can format the code of Umi documentation plugin using the following command:

```bash
$ pnpm format:plugin-docs
```

You can build Umi documentation using the following command:

```bash
$ pnpm doc:build
```

## Adding a New Package

Adding a new package has a script that encapsulates the process. You don't need to manually copy `package.json` and other files:

```bash
# Create a package directory
$ mkdir packages/foo
# Initialize package development
$ pnpm bootstrap
```

## Updating Dependencies

> It's not recommended for non-Core Maintainers to perform extensive dependency updates, as it involves dependency pre-bundling and there are several important points to consider.

You can update dependencies by running `pnpm dep:update`:

```bash
$ pnpm dep:update
```

Since Umi pre-bundles dependencies, you need to check if the updated dependencies are `devDependencies` and whether they require pre-bundling. If they do, execute `pnpm build:deps` under the corresponding package and specify the dependency to update the pre-bundled dependency files.

```bash
$ pnpm build:deps --dep webpack-manifest-plugin
```

## Publishing

Only Core Maintainers can perform releases.

```bash
$ pnpm release
```

## Join the Contributor Group

If you've submitted Bugfix or Feature PRs and are interested in contributing to Umi's maintenance, you can scan the QR code below using DingTalk (mentioning your GitHub ID) to contact me. I'll add you to the contributor group.

<img src="https://img.alicdn.com/imgextra/i2/O1CN01DLiPrU1WsbDdnwRr9_!!6000000002844-2-tps-340-336.png" />

If you're unsure about what to contribute, you can search for TODO or FIXME in the source code.