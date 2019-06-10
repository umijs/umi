# Module Processor

如下列出的模块在 `umi` 中都会被自动处理，所以开发者无需关心这些模块是如何被处理的，以及他们的 `webpack` 配置是怎样的

## Module list

* `.js, .jsx, .mjs, .jsx, .json`: 由 [babel-loader](https://www.npmjs.com/package/babel-loader) 处理
* `.ts`: 由 [ts-loader](https://www.npmjs.com/package/ts-loader) 处理
* `.graphql, .gql`: 由 [graphql-tag/loader](https://www.npmjs.com/package/graphql-tag) 处理
* `.css, .less, .sass`: 由 [css-loader](https://www.npmjs.com/package/css-loader), [postcss-loader](https://www.npmjs.com/package/postcss-loader), [less-loader](https://www.npmjs.com/package/less-loader) 处理
* `.svg`: 由 [@svgr/core](https://www.npmjs.com/package/@svgr/core) 处理。使用 `umi`，你可以用如下方式引入 `svg` 

```javascript
import { ReactComponent as Avatar } from './avatar.svg'

function Example() {
  return <Avatar />
}
```


> 所有其他未列出的模块，默认都会由 [url-loader](https://www.npmjs.com/package/url-loader) 处理
