# umi-types

Type definitions for umi.

[![NPM version](https://img.shields.io/npm/v/umi-types.svg?style=flat)](https://npmjs.org/package/umi-types) [![Build Status](https://img.shields.io/travis/umijs/umi-types.svg?style=flat)](https://travis-ci.org/umijs/umi-types) [![NPM downloads](http://img.shields.io/npm/dm/umi-types.svg?style=flat)](https://npmjs.org/package/umi-types)

## Why

## Installation

```bash
$ yarn add umi-types
```

## Usage

```ts
import { IApi } from 'umi-types';

export default function(api: IApi) {
  api.log.success('hello');
}
```

```ts
import { IApi, IModifyHTMLWithASTFunc } from 'umi-types';

export default function(api: IApi) {
  const appendHead: IModifyHTMLWithASTFunc = ($, { route, getChunkPath }) => {
    $('head').append(`<script src="${getChunkPath('a.js')}"></script>`);
  };
  api.modifyHTMLWithAST(appendHead);
}
```

## LICENSE

MIT
