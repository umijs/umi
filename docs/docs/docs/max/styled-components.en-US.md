---
order: 10
toc: content
translated_at: '2024-03-17T08:11:13.382Z'
---

# styled-components

@umijs/max comes with the [styled-components](https://styled-components.com/) styling solution built-in.

## Enabling

For @umijs/max, enable by configuring.

```ts {2}
export default {
  styledComponents: {},
}
```

For umi, first install `@umijs/plugins` dependency, then enable through configuration.

```bash
$ pnpm i @umijs/plugins -D
```

```ts
export default {
  plugins: ['@umijs/plugins/dist/styled-components'],
  styledComponents: {},
}
```

## Features

The plugin does a few things for you,

1. Most of the styled-components exports can be imported from `umi` or `@umijs/max`.

2. Supports enabling the styled-components babel plugin through configuration in dev mode only.

3. Supports declaring global styles via runtime configuration.

## Configuration Options

The following configurations can be made in `styledComponents`.

- `babelPlugin`: Object, enable the styled-components babel plugin, effective in dev mode only

For example:

```ts
export default {
  styledComponents: {
    babelPlugin: {},
  },
}
```

When your import source is not `umi` / `@umijs/max`, you need to configure the import source to `topLevelImportPaths` to make the babel plugin work, such as:

```ts
import { styled } from 'alita'
```

```ts
export default {
  styledComponents: {
    babelPlugin: {
      topLevelImportPaths: ['alita']
    },
  },
}
```

## Runtime Configuration Options

Includes the following configurations.

- `GlobalStyle`: ReactComponent

For example:

```ts
import { createGlobalStyle } from "umi";

export const styledComponents = {
  GlobalStyle: createGlobalStyle`
    h1 {
      background: #ccc;
    }
  `
}
```
