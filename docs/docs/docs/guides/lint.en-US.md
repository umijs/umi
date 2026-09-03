---
order: 13
toc: content
translated_at: '2024-03-17T10:29:06.038Z'
---

# Coding Standards

We often use ESLint and Stylelint in projects to help us control coding quality. To achieve low-cost, high-performance, and more stable integration of the above tools, Umi provides out-of-the-box Lint capabilities, including the following features:

1. **Recommended Configurations**: Provides ESLint and Stylelint recommended configurations that can be directly inherited and used
2. **Unified CLI**: Provides `umi lint` CLI, integrating calls to ESLint and Stylelint
3. **Stable Rules**: Always ensures the stability of rules to avoid situations where upstream configuration updates cause lint failures in existing projects

The ESLint configuration has the following characteristics:

1. **Quality-Related Only**: We have selected dozens of quality-related rules from hundreds of rules to whitelist, returning to the essence of Lint, without conflict with Prettier's rules
2. **Performance Priority**: Some TypeScript rules are of low practicability but incur high project-wide compilation costs, so we disable these rules to improve performance
3. **Built-in Common Plugins**: Includes react, react-hooks, @typescript/eslint, jest, meeting daily needs

Additionally, the Stylelint configuration also includes built-in support for CSS-in-JS, allowing for the detection of stylesheet syntax errors in JS files. Sounds attractive? Let's see how to integrate it.

## How to Use
### Installation

To save on installation size, at present, the Lint module is only built into Umi Max. Use `max lint` to execute the lint process. **If you are using Umi, you need to first install `@umijs/lint`**:

```bash
$ npm i @umijs/lint -D
# or
$ pnpm add @umijs/lint -D
```

Then install ESLint and Stylelint:

> The current version of `stylelint` used by `@umijs/lint` is v14  

```bash
$ npm i -D eslint "stylelint@^14"
# or
$ pnpm add -D eslint "stylelint@^14"
```

### Enable Configuration

Inherit the configuration provided by Umi in your `.eslintrc.js` and `.stylelintrc.js`:

```js
// .eslintrc.js
module.exports = {
  // For Umi projects
  extends: require.resolve('umi/eslint'),

  // For Umi Max projects
  extends: require.resolve('@umijs/max/eslint'),
}

// .stylelintrc.js
module.exports = {
  // For Umi projects
  extends: require.resolve('umi/stylelint'),

  // For Umi Max projects
  extends: require.resolve('@umijs/max/stylelint'),
}
```

After the configuration files are created, we can already use the `eslint` and `stylelint` commands to execute lint, but we still recommend using the `umi lint` command for a more convenient experience.

### CLI

The usage of the `umi lint` command is as follows:

```bash
$ umi lint [glob] [--fix] [--eslint-only] [--stylelint-only] [--cssinjs]
```

Parameters explanation:

```bash
  [glob]: Optional, specify the files to lint, default is `{src,test}/**/*.{js,jsx,ts,tsx,css,less}`
  --quiet: Optional, disable reporting of `warn` rules, only output `error`
  --fix: Optional, auto-fix lint errors
  --eslint-only: Optional, execute ESLint only
  --stylelint-only: Optional, execute Stylelint only
  --cssinjs: Optional, enable CSS-in-JS support for Stylelint
```

Generally, directly executing `umi lint` should meet most needs.

## Integrating with Git Workflow

We also recommend using [lint-staged](https://github.com/okonet/lint-staged#readme) and [Husky](https://typicode.github.io/husky/), integrating `umi lint` with the Git workflow to automatically lint **the current changes** when **committing code**.

### lint-staged

lint-staged is used to drive the `umi lint` command, checking only the changed content each time.

Installation method:

```bash
$ npm i lint-staged -D
#or
$ pnpm add lint-staged -D
```

Configure lint-staged in `package.json`:

```diff
{
+   "lint-staged": {
+     "*.{js,jsx,ts,tsx,css,less}": [
+       "umi lint"
+     ]
+   }
}
```

Now, if you execute `git add sample.js` and then `npx lint-staged`, it will only check the current changes in `sample.js`.

### Husky

Husky is used to bind Git Hooks to execute desired commands at specified timings (e.g., `pre-commit`). For installation methods, please refer to the Husky documentation: https://typicode.github.io/husky/#/?id=automatic-recommended

After initialization, modify the content of `.husky/pre-commit` manually:

```diff
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

- npm test
+ npx lint-staged
```

Now you're all set. Each time you execute the `git commit` command, `umi lint` will automatically check the code changes, ensuring coding quality while also ensuring execution efficiency.

## Prettier

On top of enabling `umi lint`, we also suggest using [Prettier](https://prettier.io/docs/en/install.html) together to ensure that the team's coding style is basically consistent.

Refer to the Prettier documentation to configure it with lint-staged: https://prettier.io/docs/en/install.html#git-hooks

## Appendix

1. ESLint rules built into Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/eslint/rules/recommended.ts
2. Stylelint configuration built into Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/stylelint/index.ts
