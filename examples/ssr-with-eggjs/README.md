# ssr-with-eggjs

## Install

```sh
$ yarn
```

## Usage

Development

```sh
$ npm run dev
$ open http://localhost:7001/
```

Build

```bash
$ npm run build
```

# 国际化

目前是按照 cookie > 浏览器默认语言 > 默认语言顺序选择 由于服务端获取不到 localStorage，所以要通过 cookie 将 所需信息带到服务端

# 部署

egg 内置了 cluster 模式，执行 yarn start 即可，详情见[egg 官网](https://eggjs.org)
