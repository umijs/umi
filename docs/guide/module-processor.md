# Module Processor

Following modules will be handed via `umi` by default, so you don't have to worry about webpack configuration for them.

## Module list

* `.js, .jsx, .mjs, .jsx, .json`: handled by [babel-loader](https://www.npmjs.com/package/babel-loader)
* `.ts`: handled by [ts-loader](https://www.npmjs.com/package/ts-loader)
* `.graphql, .gql`: handled by [graphql-tag/loader](https://www.npmjs.com/package/graphql-tag)
* `.css, .less, .sass`: handled by [css-loader](https://www.npmjs.com/package/css-loader), [postcss-loader](https://www.npmjs.com/package/postcss-loader), [less-loader](https://www.npmjs.com/package/less-loader)
* `.svg`: handled by [@svgr/core](https://www.npmjs.com/package/@svgr/core). You can import svg as component as below:

```javascript
import { ReactComponent as Avatar } from './avatar.svg'

function Example() {
  return <Avatar />
}
```


> All other unspecified modules will be handled via [url-loader](https://www.npmjs.com/package/url-loader)
