
# eslint-config-umi

Eslint config for umi projects, support js and ts.

## Why support ts

[TSLint in 2019](https://medium.com/palantir/tslint-in-2019-1a144c2317a9)

## Install

```bash
$ yarn add eslint-config-umi --dev
```

## For js and ts project both

`.eslintrc`

```json
{
    "extends": "umi"
}
```

usage

```bash
$ eslint src/ --ext js,jsx,ts,tsx
```
