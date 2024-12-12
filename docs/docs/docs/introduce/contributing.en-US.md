---
order: 3
toc: content
translated_at: '2024-03-17T09:56:34.842Z'
---

# Contributing

❤️ Loving Umi and want to get involved? Thanks!

## Environment Setup

### Node.js and pnpm

Developing Umi requires Node.js 18+ and `pnpm` v8.

It's recommended to use [Volta](https://volta.sh/) to manage the node and pnpm version. And you need to set the `VOLTA_FEATURE_PNPM` environment variable to enable pnpm support.

```bash
export VOLTA_FEATURE_PNPM=1
```

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

A must-run command for local development of Umi, for compiling TypeScript files in the `src` directory to the `dist` directory, and incrementally compiles on file changes.

```bash
$ pnpm dev
```

If you find it rather slow, you can also run the `pnpm dev` command for a specific package, for example.

```bash
$ cd packages/umi
$ pnpm dev
```

### Run Example

The `examples` directory contains various examples used for testing. Running an example is a common way to ensure functions work correctly during Umi development. Each example is equipped with a dev script, so just enter the example and run `pnpm dev`.

```bash
$ cd examples/boilerplate
$ pnpm dev
```

To run in vite mode, add the `--vite` argument,

```bash
$ pnpm dev --vite
```

### Testing

Currently running tests is fast, completing in just over 10s+. It’s recommended to run tests locally before submitting a PR to reduce Round Trips.

```bash
$ pnpm test
...
Test Suites: 1 skipped, 43 passed, 43 of 44 total
Tests:       6 skipped, 167 passed, 173 total
Snapshots:   0 total
Time:        13.658 s
Ran all test suites.
```

To run tests for specific files, use `pnpm jest` because `pnpm test` runs with turborepo enabled.

For example,

```bash
$ pnpm jest packages/plugin-docs/src/compiler.test.ts
```

## Contributing to Umi Documentation

Umi's documentation is implemented by Umi@4 and the `@umijs/plugin-docs` plugin, essentially an Umi project. Execute the following commands in the root directory to start development:

```bash
# Install Umi document dependencies
$ pnpm doc:deps
# Start Umi document development
# Compilation takes longer on first launch, please be patient
$ pnpm doc:dev
```

Open the specified port number to see real-time updates of documentation and results of the `@umijs/plugin-docs` plugin development.

### Writing Umi Documentation

Umi documentation is written in MDX format. MDX is an extension of the Markdown format allowing you to insert JSX components while writing Umi documentation.

:::success{title=🏆︎}
When writing **Documentation**, you can find usable components in `packages/plugin-docs/client/theme-doc/components`. When writing **Blog posts**, usable components can be found in `packages/plugin-docs/client/theme-blog/components`.
:::

Umi documentation code highlighting is based on [`Rehype Pretty Code`](https://github.com/atomiks/rehype-pretty-code), for full capabilities and instructions, please visit its [official documentation](https://rehype-pretty-code.netlify.app).

Execute the following command in the root directory to format existing Umi documentation:

```bash
$ pnpm format:docs
```

After formatting the documentation, it is recommended to **only submit the Umi documents you have written or modified**. Different document contributors have varying writing styles and formatting may not always retain the original intended style.

### Participating in Umi Documentation Plugin Development

Open a new terminal and execute the following commands:

```bash
$ cd packages/plugin-docs
$ pnpm dev:css
```

Now, when you modify the `tailwind.css` file or TailwindCSS style classes during development, a `tailwind.out.css` stylesheet file will be automatically compiled and generated.

Umi listens for changes in the `docs` and `packages/plugin-docs/client` directories, but does not listen to changes in `packages/plugin-docs/src`.

:::info{title=💡}
If you need to compile files in `packages/plugin-docs/src`, please move to the `packages/plugin-docs` directory and execute the `pnpm build` command, then restart development.
:::

Executing the following command in the root directory to format the code of Umi documentation plugin:

```bash
$ pnpm format:plugin-docs
```

Execute the following command in the root directory to build Umi documentation:

```bash
$ pnpm doc:build
```

## Adding a New Package

Adding a new package has a script encapsulated, no need to manually copy `package.json`, etc.:

```bash
# Create package directory
$ mkdir packages/foo
# Initialize package development
$ pnpm bootstrap
```

## Updating Dependencies

> It is not recommended for non-Core Maintainers to update a large number of dependencies because it involves pre-packaging of dependencies and there are many points to note.

Run `pnpm dep:update` to update dependencies.

```bash
$ pnpm dep:update
```

Since Umi pre-packages some dependencies, after updating dependencies, it's necessary to check if the updated dependency is in devDependencies and whether it has been pre-packaged. If so, execute `pnpm build:deps` in the corresponding package and specify the dependency to update pre-packaged dependency files.

```bash
$ pnpm build:deps --dep webpack-manifest-plugin
```

## Release

Only Core Maintainers can carry out releases.

```bash
$ pnpm release
```

## Rolling Back through dist-tag

For example, to roll back to 4.0.81.

```bash
$ pnpm -rc --filter "./packages/**" exec pnpm dist-tag add \$PNPM_PACKAGE_NAME@4.0.81 latest
```

## Joining the Contributor Group

For those who have submitted Bugfix or Feature type PRs and are interested in participating in maintaining Umi, you can first scan the QR code below with DingTalk (mention your github id), and then I will add you to the group.

<img src="https://img.alicdn.com/imgextra/i2/O1CN01DLiPrU1WsbDdnwRr9_!!6000000002844-2-tps-340-336.png" />

If you don't know what you can contribute, you can search TODO or FIXME in the source code.
