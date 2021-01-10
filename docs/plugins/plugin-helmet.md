---
translateHelp: true
---

# @umijs/plugin-helmet

Integrate [react-helmet](https://github.com/nfl/react-helmet) to manage HTML document tags (such as title, description, etc.).

## How to enable

It is turned on by default.

## Introduction

Contains the following functions,

1. Export [react-helmet](https://github.com/nfl/react-helmet#example) API and import directly from umi
2. Support [Server Rendering (SSR)](/zh-CN/docs/ssr)

![helmet](https://user-images.githubusercontent.com/13595509/82291009-b8c41580-99da-11ea-8d77-128f59a273e5.png)

## Use

```js
import React from 'react';
import { Helmet } from 'umi';

const Application = () => {
 return (
    <div className="application">
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
    </div>
  );
}

export default Application;
```

## FAQ

### The title flashes and disappears

The title configuration in react-helmet and umi cannot be used at the same time, you can turn off the default title configuration by configuring `title: false`

### Content is encoded

Configurable Helmet component property `encodeSpecialCharacters` to close the content being encoded

```jsx
<Helmet encodeSpecialCharacters={false}>
  ...
</Helmet>
```
