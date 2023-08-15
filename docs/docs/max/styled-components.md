# styled-components

`@umijs/max` comes with built-in support for the [styled-components](https://styled-components.com/) styling solution.

## Activation

If you're using `@umijs/max`, enable it by configuring the following:

```ts {2}
export default {
  styledComponents: {},
}
```

If you're using Umi, first install the `@umijs/plugins` dependency, then activate it through configuration.

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

The plugin handles a few tasks for you:

1. Most styled-components exports can be imported from either `umi` or `@umijs/max`.

2. It supports enabling the styled-components Babel plugin through configuration, applicable only in the development mode.

3. It supports declaring global styles through runtime configuration.

## Configuration Options

You can use the following configurations under `styledComponents`:

- `babelPlugin`: Object, enable the styled-components Babel plugin, only effective in development mode.

For example:

```ts
export default {
  styledComponents: {
    babelPlugin: {},
  },
}
```

## Runtime Configuration Options

This includes the following configuration:

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

