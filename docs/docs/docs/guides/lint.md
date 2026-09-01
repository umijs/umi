---
order: 13
toc: content
---
# 编码规范

我们通常会在项目中使用 JavaScript/TypeScript Lint 与 Stylelint 来协助我们把控编码质量。为了实现低成本、高性能、更稳定的接入，Umi 提供了开箱即用的 Lint 能力，包含以下特性：

1. **推荐规则**：为 JavaScript、TypeScript 及样式文件提供开箱即用的推荐规则
2. **统一的 CLI**：提供 `umi lint` CLI，使用 utoo-lint 检查 JavaScript/TypeScript，使用 Stylelint 检查样式
3. **规则稳定**：始终确保规则的稳定性，不会出现上游配置更新导致存量项目 lint 失败的情况

其中，JavaScript/TypeScript Lint 具备如下特点：

1. **仅质量相关**：我们从数百条规则中筛选出数十条与编码质量相关的规则进行白名单开启，回归 Lint 本质，且不会与 Prettier 的规则冲突
2. **性能优先**：基于原生实现的 utoo-lint 执行，并为 TypeScript 文件应用独立的规则覆盖
3. **渐进兼容**：仅启用当前 utoo-lint 已支持的 Umi 推荐规则，后续随上游能力逐步补齐

另外，Stylelint 配置还内置 CSS-in-JS 支持，可以检测出 JS 文件中的样式表语法错误。听起来很有吸引力？来看看如何接入吧。

## 使用方式
### 安装

为了节省安装体积，目前仅在 Umi Max 中内置了 Lint 模块，使用 `max lint` 来执行 lint 过程。**如果你使用的是 Umi，需要先安装 `@umijs/lint`**：

```bash
$ npm i @umijs/lint -D
# or
$ pnpm add @umijs/lint -D
```

然后安装 Stylelint：

> 目前 `@umijs/lint` 使用的 `stylelint` 版本是 v14  

```bash
$ npm i -D "stylelint@^14"
# or
$ pnpm add -D "stylelint@^14"
```

### 启用配置

`umi lint` 已内置 JavaScript/TypeScript 推荐规则，无需创建配置文件。如需覆盖规则，可在项目根目录添加 `utlint.config.json`：

```json
{
  "rules": {
    "no-console": "warn"
  }
}
```

样式检查仍需在 `.stylelintrc.js` 中继承 Umi 提供的配置：

```js
// .stylelintrc.js
module.exports = {
  // Umi 项目
  extends: require.resolve('umi/stylelint'),

  // Umi Max 项目
  extends: require.resolve('@umijs/max/stylelint'),
}
```

如果仍需单独运行 ESLint，可以安装 `eslint` 并继续在 `.eslintrc.js` 中继承 `umi/eslint` 或 `@umijs/max/eslint`。该兼容配置只作用于独立的 `eslint` 命令；`umi lint` 的 JavaScript/TypeScript 检查由 utoo-lint 执行。

### CLI

`umi lint` 命令的用法如下：

```bash
$ umi lint [glob] [--fix] [--eslint-only] [--stylelint-only] [--cssinjs]
```

参数说明：

```bash
  [glob]: 可选，指定要 lint 的文件，默认为 `{src,test}/**/*.{js,jsx,ts,tsx,css,less}`
  --quiet: 可选，禁用 `warn` 规则的报告，仅输出 `error`
  --fix: 可选，自动修复 utoo-lint 或 Stylelint 已支持修复的错误
  --eslint-only: 可选，仅使用 utoo-lint 检查 JavaScript/TypeScript（参数名为兼容保留）
  --stylelint-only: 可选，仅执行 Stylelint
  --cssinjs: 可选，为 Stylelint 启用 CSS-in-JS 支持
```

通常来说，直接执行 `umi lint` 应该就能满足大部分情况。

## 与 Git 工作流结合

我们也推荐使用 [lint-staged](https://github.com/okonet/lint-staged#readme) 和 [Husky](https://typicode.github.io/husky/)，将 `umi lint` 与 Git 工作流结合使用，以便在**提交代码时**自动 lint **本次变更**的代码。

### lint-staged

lint-staged 用来驱动 `umi lint` 命令，每次仅将变更的内容交给 `umi lint` 进行检查。

安装方式：

```bash
$ npm i lint-staged -D
#or
$ pnpm add lint-staged -D
```

在 `package.json` 中配置 lint-staged：

```diff
{
+   "lint-staged": {
+     "*.{js,jsx,ts,tsx,css,less}": [
+       "umi lint"
+     ]
+   }
}
```

此时如果执行 `git add sample.js` 后，再执行 `npx lint-staged`，就能实现仅检查 `sample.js` 本次的变更了。

### Husky

Husky 用来绑定 Git Hooks、在指定时机（例如 `pre-commit`）执行我们想要的命令，安装方式请参考 Husky 文档：https://typicode.github.io/husky/#/?id=automatic-recommended

初始化完成后，需要手动修改 `.husky/pre-commit` 文件的内容：

```diff
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

- npm test
+ npx lint-staged
```

至此大功告成，每次执行 `git commit` 命令的时候，`umi lint` 就能自动对本次变更的代码进行检查，在确保编码质量的同时也能确保执行效率。

## Prettier

在启用 `umi lint` 的基础上，我们也建议与 [Prettier](https://prettier.io/docs/en/install.html) 一同使用，以确保团队的代码风格是基本一致的。

可参考 Prettier 文档将其配置到 lint-staged 中：https://prettier.io/docs/en/install.html#git-hooks

## 附录

1. Umi 内置的 JavaScript/TypeScript 规则列表：https://github.com/umijs/umi/blob/master/packages/lint/src/config/eslint/rules/recommended.ts
2. Umi 的 utoo-lint 配置：https://github.com/umijs/umi/blob/master/packages/lint/src/config/utoo/index.ts
3. Umi 内置的 Stylelint 配置：https://github.com/umijs/umi/blob/master/packages/lint/src/config/stylelint/index.ts
