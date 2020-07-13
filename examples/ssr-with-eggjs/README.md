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
 目前是按照cookie > 浏览器默认语言 > 默认语言顺序选择
 由于服务端获取不到localStorage，所以要通过cookie将
 所需信息带到服务端

# 部署
 egg内置了cluster模式，执行yarn start即可，详情见[egg官网](https://eggjs.org)
