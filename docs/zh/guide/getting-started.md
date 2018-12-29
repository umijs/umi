# 快速上手

> 更喜欢观看视频？可以[点此观看](https://www.youtube.com/watch?v=vkAUGUlYm24&list=PLzu0PBqV2jld2q5gCADxX17NE3gF3FvYq)

## 环境准备

首先得有 [node](https://nodejs.org/en/)，并确保 node 版本是 8.10 或以上。（mac 下推荐使用 [nvm](https://github.com/creationix/nvm) 来管理 node 版本）

```bash
$ node -v
8.1x
```

推荐使用 yarn 管理 npm 依赖，并[使用国内源](https://github.com/yiminghe/tyarn)（阿里用户使用内网源）。

```bash
# 国内源
$ npm i yarn tyarn -g
# 后面文档里的 yarn 换成 tyarn
$ tyarn -v

# 阿里内网源
$ tnpm i yarn @ali/yarn -g
# 后面文档里的 yarn 换成 ayarn
$ ayarn -v
```

然后全局安装 umi，并确保版本是 2.0.0 或以上。

```bash
$ yarn global add umi
$ umi -v
2.0.0
```

## 脚手架

先找个地方建个空目录。

```bash
$ mkdir myapp && cd myapp
```

然后通过 `umi g` 创建一些页面，

```bash
$ umi g page index
$ umi g page users
```

> `umi g` 是 `umi generate` 的别名，可用于快速生成 component、page、layout 等，并且可在插件里被扩展，比如 umi-plugin-dva 里扩展了 dva:model，然后就可以通过 `umi g dva:model foo` 快速 dva 的 model。

然后通过 tree 查看下目录，（windows 用户可跳过此步）

```bash
$ tree
.
└── pages
    ├── index.css
    ├── index.js
    ├── users.css
    └── users.js
```

这里的 pages 目录是页面所在的目录，umi 里约定默认情况下 pages 下所有的 js 文件即路由，如果有 [next.js](https://github.com/zeit/next.js) 或 [nuxt.js](https://nuxtjs.org/) 的使用经验，应该会有点眼熟吧。

然后启动本地服务器，

```bash
$ umi dev
```

<img src="https://gw.alipayobjects.com/zos/rmsportal/SGkKMTPMJWFnYMbyznFW.png" width="616" />

## 约定式路由

启动 `umi dev` 后，大家会发现 pages 下多了个 `.umi` 的目录。这是啥？这是 umi 的临时目录，可以在这里做一些验证，但请不要直接在这里修改代码，umi 重启或者 pages 下的文件修改都会重新生成这个文件夹下的文件。

然后我们在 index 和 users 直接加一些路由跳转逻辑。

先修改 `pages/index.js`，

```diff
+ import Link from 'umi/link';
import styles from './index.css';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>Page index</h1>
+     <Link to="/users">go to /users</Link>
    </div>
  );
}
```

再修改 `pages/users.js`，

```diff
+ import router from 'umi/router';
import styles from './index.css';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>Page index</h1>
+     <button onClick={() => { router.goBack(); }}>go back</button>
    </div>
  );
}
```

然后浏览器验证，应该已经可以在 index 和 users 两个页面之间通过路由跳转了。

## 部署发布

### 构建

执行 `umi build`，

```bash
$ umi build

DONE  Compiled successfully in 1729ms

File sizes after gzip:

  68.04 KB  dist/umi.js
  83 B      dist/umi.css
```

构建产物默认生成到 `./dist` 下，然后通过 tree 命令查看，(windows 用户可忽略此步）

```bash
$ tree ./dist
./dist
├── index.html
├── umi.css
└── umi.js
```

### 本地验证

发布之前，可以通过 `serve` 做本地验证，

```bash
$ yarn global add serve
$ serve ./dist

Serving!

- Local:            http://localhost:5000
- On Your Network:  http://{Your IP}:5000

Copied local address to clipboard!
```

访问 http://localhost:5000，正常情况下应该是和 `umi dev` 一致的。

### 部署

本地验证完，就可以部署了，这里通过 [now](http://now.sh/) 来做演示。

```bash
$ yarn global add now
$ now ./dist

> Deploying /private/tmp/sorrycc-1KVCmK/dist under chencheng
> Synced 3 files (301.93KB) [2s]
> https://dist-jtckzjjatx.now.sh [in clipboard] [1s]
> Deployment complete!
```

然后打开相应的地址就能访问到线上的地址了。
