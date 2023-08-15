# Coding Standards

In projects, we often use ESLint and Stylelint to help maintain code quality. To make it easy and efficient to integrate these tools while minimizing complexity and enhancing stability, Umi offers an out-of-the-box linting capability. This includes the following features:

1. **Recommended Configuration**: Provides recommended configurations for ESLint and Stylelint that you can directly extend.
2. **Unified CLI**: Provides the `umi lint` CLI, which integrates both ESLint and Stylelint.
3. **Stable Rules**: Ensures the stability of linting rules, preventing situations where updates to upstream configurations cause existing projects to fail linting.

The ESLint configuration has the following characteristics:

1. **Quality-focused**: We have selected a subset of rules from hundreds of available rules that are related to code quality. This approach focuses on the essence of linting while avoiding conflicts with Prettier rules.
2. **Performance Priority**: We have disabled some TypeScript rules that are not very useful in practice but have a high compilation cost for the whole project.
3. **Built-in Common Plugins**: It includes presets for react, react-hooks, @typescript/eslint, and jest to cover common needs.

Additionally, the Stylelint configuration includes support for CSS-in-JS, enabling detection of syntax errors in style sheets within JavaScript files. Sounds appealing? Let's see how to integrate it.

## Usage
### Installation

To save installation size, currently, the lint module is only built into Umi Max. Use `max lint` to run the linting process. **If you are using Umi, you need to install `@umijs/lint` first**:

```bash
$ npm i @umijs/lint -D
# or
$ pnpm add @umijs/lint -D
```

Then install ESLint and Stylelint:

```bash
$ npm i eslint stylelint -D
# or
$ pnpm add eslint stylelint -D
```

### Enabling Configurations

In `.eslintrc.js` and `.stylelintrc.js`, inherit the provided configurations from Umi:

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

After creating the configuration files, you can use the `eslint` and `stylelint` commands to run linting. However, we still recommend using the `umi lint` command for a more convenient experience.

### CLI

The usage of the `umi lint` command is as follows:

```bash
$ umi lint [glob] [--fix] [--eslint-only] [--stylelint-only] [--cssinjs]
```

Parameter explanations:

```bash
  [glob]: Optional, specifies the files to lint. Defaults to `{src,test}/**/*.{js,jsx,ts,tsx,css,less}`
  --quiet: Optional, disables reporting of `warn` rules, only outputs `error`
  --fix: Optional, automatically fixes lint errors
  --eslint-only: Optional, only executes ESLint
  --stylelint-only: Optional, only executes Stylelint
  --cssinjs: Optional, enables CSS-in-JS support for Stylelint
```

In most cases, simply running `umi lint` should suffice.

## Integrating with Git Workflow

We also recommend using [lint-staged](https://github.com/okonet/lint-staged#readme) and [Husky](https://typicode.github.io/husky/) to automatically lint the code for the changes you're committing using the `umi lint` command.

### lint-staged

lint-staged is used to run the `umi lint` command on changed files only, ensuring that only modified files are checked.

Install lint-staged:

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

Now, running `npx lint-staged` after adding a file (e.g., `git add sample.js`) will lint only the changes made to `sample.js`.

### Husky

Husky is used to bind Git hooks and execute desired commands at specific events (e.g., `pre-commit`). Refer to the Husky documentation for installation: https://typicode.github.io/husky/#/?id=automatic-recommended

After installation, manually modify the content of the `.husky/pre-commit` file:

```diff
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

- npm test
+ npx lint-staged
```

With this setup, every time you run `git commit`, the `umi lint`

 command will automatically lint the code changes made in the commit. This ensures code quality and efficiency.

## Prettier

In addition to using `umi lint`, we also recommend using [Prettier](https://prettier.io/docs/en/install.html) to maintain consistent code formatting within the team.

You can refer to the Prettier documentation to configure it with lint-staged: https://prettier.io/docs/en/install.html#git-hooks

## Appendix

1. List of built-in ESLint rules in Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/eslint/rules/recommended.ts
2. Built-in Stylelint configuration in Umi: https://github.com/umijs/umi/blob/master/packages/lint/src/config/stylelint/index.ts
