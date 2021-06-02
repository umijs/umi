# config-base

## Deploy html to a non-root directory

Users frequently ask the question:

> Why does my local development environment look good, but after deploying to production, there is no response, and there are no errors reported?

This commonly happens when the application is deployed to a non-root path. Why does this happen? In a nutshell it is because the route does not match: when you deploy the application under `/xxx/`, and then visit `/xxx/hello`, the code matches `/hello`, which will not match, and since the fallback route is not defined, such as a 404, a blank page will be displayed instead.

How can you fix this?

To fix this issue, you can configure the [base path](../config#base):

```bash
export default {
  base: '/path/to/your/app/root',
};
```

## How to use

Execute [`@umijs/create-umi-app`](https://github.com/umijs/umi/tree/master/packages/create-umi-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx @umijs/create-umi-app --example config-base config-base-app
# or
yarn create @umijs/umi-app --example config-base config-base-app
```
