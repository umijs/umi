---
order: 10
toc: content
---
# styled-components

@umijs/max 内置了 [styled-components](https://styled-components.com/) 样式方案。

## 启用方式

如果是 @umijs/max，配置开启。

```ts {2}
export default {
  styledComponents: {},
}
```

如果是 umi，先安装 `@umijs/plugins` 依赖，再通过配置开启。

```bash
$ pnpm i @umijs/plugins -D
```

```ts
export default {
  plugins: ['@umijs/plugins/dist/styled-components'],
  styledComponents: {},
}
```

## 特性

插件帮你做了几件事，

1、大部分 styled-components 的导出可以从 `umi` 或 `@umijs/max` 里 import 使用。

2、支持通过配置的方式开启 styled-components 的 babel 插件，仅 dev 模式有效。

3、支持通过运行时配置的方式声明全局样式。

## 配置项

可以在 `styledComponents` 中做以下配置。

- `babelPlugin`: Object，开启 styled-components 的 babel 插件，仅 dev 模式有效

比如：

```ts
export default {
  styledComponents: {
    babelPlugin: {},
  },
}
```

当你的导入来源不是 `umi` / `@umijs/max` 时，需将导入来源配置到 `topLevelImportPaths` 才可以使该 babel 插件生效，如：

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

## 运行时配置项

包含以下配置。

- `GlobalStyle`：ReactComponent

比如：

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

