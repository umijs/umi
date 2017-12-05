# Configuration

## How to config

Config via `.webpackrc`, e.g.

```js
{
  "alias": { "react": "preact-compat" }
}
```

If you like to write config in JavaScript, config in `.webpackrc.js`, e.g.

```js
export default {
  alias: {
    react: 'preact-compat',
  },
}
```

## Options

|  | Default Value | Notes |
| :--- | :--- | :--- |
| entry | null |  |
| browsers | [ '>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9' ] |  |
| theme | {} |  |
| babel |  |  |
| define | {} |  |
| outputPath | null |  |
| publicPath | undefined |  |
| commons | [] |  |
| hash | false |  |
| externals | {} |  |
| copy | [] |  |
| disableCSSModules | false |  |
| extraBabelIncludes | [] |  |
| extraResolveExtensions | [] |  |
| extraPostCSSPlugins | [] |  |
| ignoreMomentLocale | false |  |
| extraResolveModules | [] |  |
| disableCSSSourceMap | false |  |
| sass | {} |  |
| devtool | false |  |
