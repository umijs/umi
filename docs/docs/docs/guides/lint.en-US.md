---
order: 13
toc: content
translated_at: '2024-03-17T10:29:06.038Z'
---

# Coding Standards

We often use JavaScript/TypeScript linting and Stylelint to control code quality. Umi provides an out-of-the-box lint workflow with the following features:

1. **Recommended Rules**: Provides ready-to-use rules for JavaScript, TypeScript, and style files
2. **Unified CLI**: Uses utoo-lint for JavaScript/TypeScript and Stylelint for styles through `umi lint`
3. **Stable Rules**: Always ensures the stability of rules to avoid situations where upstream configuration updates cause lint failures in existing projects

JavaScript/TypeScript linting has the following characteristics:

1. **Quality-Related Only**: We have selected dozens of quality-related rules from hundreds of rules to whitelist, returning to the essence of Lint, without conflict with Prettier's rules
2. **Performance Priority**: Runs on the native utoo-lint engine and applies a separate rule override to TypeScript files
3. **Progressive Compatibility**: Enables the Umi recommended rules currently supported by utoo-lint and expands coverage as upstream support lands

Additionally, the Stylelint configuration also includes built-in support for CSS-in-JS, allowing for the detection of stylesheet syntax errors in JS files. Sounds attractive? Let's see how to integrate it.

## How to Use
### Installation

To save on installation size, at present, the Lint module is only built into Umi Max. Use `max lint` to execute the lint process. **If you are using Umi, you need to first install `@umijs/lint`**:

```bash
$ npm i @umijs/lint -D
# or
$ pnpm add @umijs/lint -D
```

Then install Stylelint:

> The current version of `stylelint` used by `@umijs/lint` is v14  

```bash
$ npm i -D "stylelint@^14"
# or
$ pnpm add -D "stylelint@^14"
```

### Enable Configuration

`umi lint` includes the JavaScript/TypeScript recommended rules, so no configuration file is required. To override rules, add `utlint.config.json` to the project root:

```json
{
  "rules": {
    "no-console": "warn"
  }
}
```

Style linting still requires the Umi configuration in `.stylelintrc.js`:

```js
// .stylelintrc.js
module.exports = {
  // For Umi projects
  extends: require.resolve('umi/stylelint'),

  // For Umi Max projects
  extends: require.resolve('@umijs/max/stylelint'),
}
```

If you still need to run ESLint directly, install `eslint` and keep extending `umi/eslint` or `@umijs/max/eslint` from `.eslintrc.js`. This compatibility configuration affects the standalone `eslint` command only; `umi lint` uses utoo-lint for JavaScript and TypeScript.

### CLI

The usage of the `umi lint` command is as follows:

```bash
$ umi lint [glob] [--fix] [--eslint-only] [--stylelint-only] [--cssinjs]
```

Parameters explanation:

```bash
  [glob]: Optional, specify the files to lint, default is `{src,test}/**/*.{js,jsx,ts,tsx,css,less}`
  --quiet: Optional, disable reporting of `warn` rules, only output `error`
  --fix: Optional, auto-fix errors supported by utoo-lint or Stylelint
  --eslint-only: Optional, lint JavaScript/TypeScript with utoo-lint only (name retained for compatibility)
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

1. JavaScript/TypeScript rules built into Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/eslint/rules/recommended.ts
2. Umi utoo-lint configuration: https://github.com/umijs/umi/blob/master/packages/lint/src/config/utoo/index.ts
3. Stylelint configuration built into Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/stylelint/index.ts
