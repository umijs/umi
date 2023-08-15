# Scaffold

The Umi official provides a scaffold that allows you to easily and quickly create a project:

```bash
pnpm dlx create-umi@latest
```

This command will install the `create-umi` scaffold and automatically run it. After running, it provides two options to choose from:

1. Pick Npm Client

You can choose your preferred Node dependency management tool from the following options:

- [npm](https://www.npmjs.com/)
- [cnpm](https://github.com/cnpm/cnpm)
- [tnpm](https://web.npm.alibaba-inc.com/)
- [yarn](https://yarnpkg.com/)
- [pnpm](https://pnpm.io/) (Umi's official recommendation)

2. Pick Npm Registry

- [npm](https://www.npmjs.com/)
- [taobao](https://npmmirror.com/)

After making the selections, it will generate a basic Umi project and install dependencies based on the chosen client and registry:

```text
.
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── assets
│   │   └── yay.jpg
│   ├── layouts
│   │   ├── index.less
│   │   └── index.tsx
│   └── pages
│       ├── docs.tsx
│       └── index.tsx
├── tsconfig.json
└── typings.d.ts
```

This way, you can initialize a Umi project with just one command.
