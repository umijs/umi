# umi project d

## Getting Started

Install dependencies,

```bash
$ yarn
```

Start the dev server,

```bash
$ yarn dev
```

Start the prod server

```bash
$ yarn build
$ yarn start
```

# 国际化

目前是按照 cookie > 浏览器默认语言 > 默认语言顺序选择
由于服务端获取不到 localStorage，所以要通过 cookie 将
所需信息带到服务端

# 部署

部署时可以用 pm2 进行部署（注意要采用多进程方式部署）
静态文件最好是放 cdn，如果放到服务器上，最好是用 nginx 直接配置静态目录
