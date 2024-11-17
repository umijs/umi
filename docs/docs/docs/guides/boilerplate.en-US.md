---
order: 11
toc: content
translated_at: '2024-03-17T10:35:15.206Z'
---

# Scaffolding

Umi officially provides a scaffold, which allows you to easily and quickly create a project:

```bash
# Input the path to the project directory when prompted by the wizard
pnpm create umi
# Create a project under the my-umi-app folder in the current directory
pnpm create umi my-umi-app
```

This command installs the `create-umi` scaffold and runs it automatically. After running, it offers two options:

1. Pick Npm Client - Choose an Npm client

You can select your preferred Node dependency management tool from the following options:

- [npm](https://www.npmjs.com/)
- [cnpm](https://github.com/cnpm/cnpm)
- [tnpm](https://web.npm.alibaba-inc.com/)
- [yarn](https://yarnpkg.com/)
- [pnpm](https://pnpm.io/) (officially recommended by Umi)

2. Pick Npm Registry - Choose an Npm source

- [npm](https://www.npmjs.com/)
- [taobao](https://npmmirror.com/)

After choosing, it will automatically generate the most basic Umi project and install dependencies based on the selected client and registry source:

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

This way, the initialization of the Umi project is completed with a single click.
