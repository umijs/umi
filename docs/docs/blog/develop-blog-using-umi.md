---
order: 1
toc: content
group:
  title: Blog
---

# 使用 Umi 开发一个 Blog

这篇文章将带领你使用 Umi.js 搭配 [PlanetScale](https://planetscale.com/), [Prisma](https://www.prisma.io/) 和 [Tailwindcss](https://tailwindcss.com/)等服务与技术，开发一个简单的博客网站，并部署到 [Vercel](https://vercel.com) 服务。

## 成果展示

成果看起来是这样的：你会有一个博客首页展示你的文章 [https://umi-blog-example.vercel.app/](https://umi-blog-example.vercel.app/)

![博客首页](https://img.alicdn.com/imgextra/i2/O1CN01a9YcgY24tEdndfXsw_!!6000000007448-2-tps-3104-1974.png)

点击某一篇文章可以看到这篇文章的完整内容：[https://umi-blog-example.vercel.app/posts/5](https://umi-blog-example.vercel.app/posts/5)

![博客文章页](https://img.alicdn.com/imgextra/i4/O1CN01k84YL21wHCpYx02Yc_!!6000000006282-2-tps-3104-1974.png)

当然，你还可以在博客中发表新文章：[https://umi-blog-example.vercel.app/posts/create](https://umi-blog-example.vercel.app/posts/create)

![发表文章页](https://img.alicdn.com/imgextra/i4/O1CN01DZkDt41jvt0BJMZqi_!!6000000004611-2-tps-3104-1974.png)

前提是你有登入：[https://umi-blog-example.vercel.app/login](https://umi-blog-example.vercel.app/login)

![博客登入页](https://img.alicdn.com/imgextra/i1/O1CN015ce0oY1uKkfMCa1vq_!!6000000006019-2-tps-3104-1974.png)

准备好了吗，让我们马上开始吧！

## 环境准备

首先，你必须确保你的本地环境已经准备好进行一个 Umi.js 项目的开发。如果你目前还没有开发过 Umi.js 项目，也没有在本地搭建过开发环境，建议你先阅读 [开发环境](../docs/guides/prepare) 这篇教学。

配置完本地环境以后，你已经准备好开始开发 Umi.js 项目了！跟着 [脚手架](../docs/guides/boilerplate) 这篇文档的教学，快速初始化一个 Umi.js 项目吧。

### 调整目录结构

因为我们的博客网站会使用到 Umi 4 的 API 路由功能，所以我们需要对脚手架自动产生的目录结构进行一些调整。你现在的目录结构应该看起来是这样的：

```text
.
├── assets
│    └── yay.jpg
├── layouts
│    ├── index.less
│    └── index.tsx
├── node_modules
├── package.json
├── pages
│    ├── docs.tsx
│    └── index.tsx
├── pnpm-lock.yaml
├── tsconfig.json
└── typings.d.ts
```

我们需要把 `assets`, `layouts`, `pages` 目录从根目录移动到 `src` 目录下，移动之后他看起来是这样的：

```text
.
├── src
│   ├── assets
│   │    └── yay.jpg
│   ├── layouts
│   │    ├── index.less
│   │    └── index.tsx
│   └──── pages
│        ├── docs.tsx
│        └── index.tsx
├── node_modules
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── typings.d.ts
```

:::info
为什么要这样做呢？这是因为根目录下的 `api` 目录会被我们作为 API 路由生成构建产物的地方，如果我们没有多一层 `src` 目录的话，我们的 API 路由目录就会和构建产物目录冲突啦～
:::

### 注册 PlanetScale 服务

我们的博客将会把用户和文章的数据保存在 MySQL 数据库中。然而，我们不需要真的自己准备一台服务器来运行数据库，我们可以使用免费的 [PlanetScale](https://planetscale.com/)来一键部署一个开箱即用的数据库！

首先从 [https://auth.planetscale.com/sign-in](https://auth.planetscale.com/sign-in)登入你的账号，如果你没有注册过，可以选择使用 GitHub 一键登入或是点击 [Sign up for an account](https://auth.planetscale.com/sign-up) 注册一个账号。

![登入 PlanetScale](https://img.alicdn.com/imgextra/i4/O1CN01BVVAju1eONxEM9wr5_!!6000000003861-2-tps-2506-1464.png)

登入之后，在你的 PlanetScale 账号建立一个数据库（如果你是第一次注册，则可以看到他的教学步骤带领你一步步建立一个数据库）：

![建立数据库](https://img.alicdn.com/imgextra/i4/O1CN01St4IQW21lV6f8bpKg_!!6000000007025-2-tps-3104-1974.png)

建立完成后，点击数据库页面右上角的 **Connect** 按钮：

![Connect 按钮](https://img.alicdn.com/imgextra/i4/O1CN01Hnyqbo26g4UNnSqoQ_!!6000000007690-2-tps-3104-1974.png)

你会在弹窗里面看到一个 **Connect With** 的下拉选单，选择 `Prisma`，然后就能获得一串这个格式的字符串：

```dotenv
DATABASE_URL='mysql://************:************@************.ap-southeast-2.psdb.cloud/umi-blog-example?sslaccept=strict'
```

这个字符串就是我们要用来让 Prisma 连接数据库的连线信息，暂时先把他记录起来就可以了 👍

### 安装依赖

接下来，帮我们的 Umi 项目安装这次教程会用到的依赖：

```shell
pnpm i -d prisma @types/bcryptjs @types/jsonwebtoken
pnpm i @prisma/client bcryptjs jsonwebtoken
```

这两行命令帮我们安装了这些包：

1. [prisma](https://github.com/prisma/prisma)和 [@prisma/client](https://www.npmjs.com/package/@prisma/client):这两个包让我们可以用 [Prisma](https://www.prisma.io/)来方便地串接数据库，不需要担心任何复杂的 SQL 命令。
2. [bcryptjs](https://github.com/dcodeIO/bcrypt.js):这个包让我们将用户注册后的密码使用 [Bcrypt](https://en.wikipedia.org/wiki/Bcrypt)哈希加密算法来安全的存储在数据库中。
3. [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken):这个包让我们可以方便地使用用 [JWT(Json Web Token)](https://jwt.io/) 实现用户鉴权。

然后将 `package.json` 中 `scripts` 里面的 `build` 脚本从

```
"scripts": {
  "dev": "umi dev",
  "build": "umi build",
  "postinstall": "umi setup",
  "start": "npm run dev"
},
```

改成

```
"scripts": {
  "dev": "umi dev",
  "build": "prisma generate && umi build",
  "postinstall": "umi setup",
  "start": "npm run dev"
},
```

这可以确保每次开始构建以前都已经生成好 Prisma 客户端。

### 安装 Tailwindcss

使用 Umi 提供的微生成器来在项目中启用 Tailwindcss :

```shell
npx umi g tailwindcss
```

他会帮我们安装 Tailwindcss 所需要的依赖，然后生成需要的文件。

### 初始化页面组件

接下来，当你使用 `pnpm dev`启动项目后，可能会看到错误讯息并且启动失败了。这是因为我们在配置中声明了一些页面，但并没有帮他建立对应的页面组件！

我们可以使用 Umi 的微生成器来自动生成这些页面：`login.tsx`, `posts/post.tsx`, `posts/create.tsx`:

```shell
npx umi g page login posts/post posts/create
```

新增后的目录结构是这样的：

```text
src
├── assets
│     └── yay.jpg
├── layouts
│     ├── index.less
│     └── index.tsx
└── pages
    ├── index.less
    ├── index.tsx
    ├── login.less
    ├── login.tsx
    └── posts
        ├── create.less
        ├── create.tsx
        ├── post.less
        └── post.tsx
```

现在再输入一次 `pnpm dev` 就可以看到我们的网站正常启动了。

### 配置 umi 项目

最后一步，就是要来对 Umi 项目进行配置，完整的配置可以参考 [配置](../docs/api/config) 这篇教学文档，在本次的教学中，只要按照以下配置即可：

```ts
// .umirc.ts

export default {
  npmClient: 'pnpm',
  apiRoute: {
    platform: 'vercel',
  },
  routes: [
    { path: '/', component: 'index' },
    { path: '/posts/create', component: 'posts/create' },
    { path: '/login', component: 'login' },
    { path: '/posts/:postId', component: 'posts/post' },
  ],
  plugins: [require.resolve('@umijs/plugins/dist/tailwindcss')],
  tailwindcss: {},
};
```

其中，`apiRoute` 这个配置项告诉 Umi 我们的项目启用了 **API 路由** 这个功能，而 `platform: 'vercel'` 代表我们要部署到[Vercel](https://vercel.com) 平台，在 `umi build` 的时候会针对这个平台来将 API 路由进行打包。

为了顺利部署项目到 Vercel ，你需要在项目根目录下加入一个 `vercel.json` 配置文件：

```json
{
  "build": {
    "env": {
      "ENABLE_FILE_SYSTEM_API": "1"
    }
  },
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "api/:match*"
    }
  ]
}
```

`route` 这个配置项则声明了我们网站的路由架构，可以看到我们的博客网站有这些页面：

- `/`: 首页
- `/posts/create`: 建立文章
- `/login`: 登入
- `/posts/:postId`: 某篇文章

`plugins` 配置项代表我们启用了哪些 Umi 插件，其中 `@umijs/plugins/dist/tailwindcss` 是在 Umi 中使用 Tailwindcss
的插件。下面一项 `tailwindcss: {}` 则是从配置来启用该插件的意思。

## API 路由设计

我们的整个博客网站由两大部分构成，一半是运行在浏览器内的前端代码，另一半则是运行在 Serverless Function 中的服务端代码。

为什么需要分成两边呢？这是因为有些代码我们不能让他在浏览器内运行，比如说用户鉴权、串接数据库等等的功能，这些必须作为一个服务然后以 API 的形式暴露给前端页面调用，这个部分可以透过 Umi 4 的 API 路由功能来实现。

> (这里好像放一张图可以比较清楚地解释)

因为我们已经在 `.umirc.ts` 配置文件中声明了我们要启用 API 路由功能，现在可以直接在 `src` 目录下添加一个 `api`目录，这个目录下以约定式路由的设计来提供 API 路由的开发。

作为一个博客的 API 服务，不难想到我们会需要这些接口来供用户调用：

1. 用户注册: `POST /api/register`
2. 用户登入: `POST /api/login`
3. 发表文章: `POST /api/posts`
4. 查询所有文章: `GET /api/posts`
5. 查询一篇文章: `GET /api/posts/{postId}`

所以我们可以在 `src/api` 目录下建立这些新文件：

```text
src
├── api
│     ├── login.ts
│     ├── register.ts
│     └── posts
│           ├── [postId].ts
│           └── index.ts
...
```

:::info
你可能注意到了，这里有一个文件叫做 `[postId].ts`，这个写法代表这个路由可以动态匹配不同的值。例如 `/api/posts/1` 和 `/api/posts/2` 两个请求都会交给 `src/api/posts/[postId].ts`处理，但他们的 `req.params` 分别是 `{ postId: 1 }` 和 `{ postId: 2 }`。
:::

这里的每个 `.ts` 文件就是一个 **API Handler**，他们默认导出一个函数用来处理发送到该路径的请求，我们可以暂时先这样写：

```ts
import type { UmiApiRequest, UmiApiResponse } from 'umi';

export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  res.status(400).json({ error: 'This API is not implemented yet.' });
}
```

然后你可以试着用浏览器或 [Postman](https://www.postman.com) 访问看看这些 API 路由（例如 `http://localhost:8000/api/login` )，就可以看到你刚刚写的响应数据了 🎉

![Not implemented yet](https://img.alicdn.com/imgextra/i3/O1CN01IRTlsd1HXmvCRJUt1_!!6000000000768-2-tps-1302-666.png)

我们等一下再回来实作这些 API 路由的实际功能，因为有一个更重要的事情要先做。

## 定义 Schema

现在必须要先确定一件事情：我们要保存哪些数据、以怎么样的形式保存在数据库，又是以怎么样的形式响应给前端的？

### 文章数据

文章数据（Post）每笔数据就代表了一篇博客里面的文章，我们可以按自己的系统需求来设计他需要保存的内容，例如我们的范例保存了这些数据：

- `id`: 文章 ID
- `title`: 文章标题
- `authorId`: 作者的 ID
- `tags`: 文章的标签（以逗号隔开）
- `imageUrl`: 文章封面图片的链接
- `content`: 文章的内文（markdown 格式）

### 用户数据

用户数据 (User) 每笔数据代表一个在我们博客注册的用户数据，我们可以按照自己的系统需求来设计他需要保存的内容，例如我们的范例保存了这些数据：

- `id`: 用户 ID
- `name`: 名称
- `email`: 邮箱
- `avatarUrl`: 头像链接
- `passwordHash`: 加密过的密码

### 生成配置

> 这个章节可以考虑阅读 [Prisma 官方的教学文档](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-mysql)

定义好数据格式以后，我们要让 Prisma 帮我们根据 Schema 设计来生成对应的客户端，并且自动的将数据库迁移至为我们设计的格式，

#### 连线到数据库

第一步，我们在根目录建立一个 `.env` 文件，并且在里面加入刚刚在 [注册 PlanetScale 服务](#注册-planetscale-服务) 章节拿到的连线信息。

```dotenv
# .env

DATABASE_URL='mysql://************:************@************.ap-southeast-2.psdb.cloud/umi-blog-example?sslaccept=strict'
```

#### 编写 Prisma 配置

第二步，在根目录下建立一个 `prisma/schema.prisma` 文件，并把我们设计的 Schema 按照 [Prisma 语法](https://pris.ly/d/prisma-schema) 写进去文件中：

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["referentialIntegrity"]
}

datasource db {
  provider = "mysql"
  referentialIntegrity = "prisma"
  url      = env("DATABASE_URL")
}

model Post {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String   @db.VarChar(255)
  content   String?
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  imageUrl  String?
  tags      String

  @@index(authorId)
}

model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  passwordHash  String
  name          String?
  posts         Post[]
  avatarUrl     String?
}
```

完成后，在命令行输入

```shell
npx prisma migrate dev --name init
```

他会帮我们将 MySQL 数据库迁移为我们定义的格式。 接下来，在命令行输入

```shell
npx prisma generate
```

他会帮我们生成一个按照我们的 Schema 设计量身定制的客户端包。

---

至此，我们已经顺利处理完数据库的部分，接下来只要专注于如何在 API 路由中使用 Prisma 客户端包来获取与更新数据即可。

## 实现 API 路由

我们现在要回头来实现刚刚建立的那些 `api` 目录下的 `.ts` 文件了，只要我们自己清楚：

1. API 会如何被调用 (path, request header, request body)
2. 我们应该在 API 内做什么事
3. 响应什么内容回去 (status, response header, response body)

那么 API 路由的开发就像写编写一个简单的函数一样。

### 用户注册

当用户对 `/api/register` 发起 `POST` 请求时，代表他们想要在我们的博客网站注册一个账号。

:::info
你可以在 [https://github.com/umijs/umi-blog-example/blob/main/src/api/register.ts](https://github.com/umijs/umi-blog-example/blob/main/src/api/register.ts) 找到这个示范的源代码！
:::

```ts
// src/api/register.ts

import type { UmiApiRequest, UmiApiResponse } from 'umi';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/utils/jwt';

export default async function (req: UmiApiRequest, res: UmiApiResponse) {
  switch (req.method) {
    // 如果对这个路径发起 POST 请求，代表他想要注册一个账号
    case 'POST':
      try {
        // 建立一个 Prisma 客户端，他可以帮助我们连线到数据库
        const prisma = new PrismaClient();

        // 在数据库的 User 表中建立一个新的数据
        const user = await prisma.user.create({
          data: {
            email: req.body.email,

            // 密码是经过 bcrypt 加密的
            passwordHash: bcrypt.hashSync(req.body.password, 8),
            name: req.body.name,
            avatarUrl: req.body.avatarUrl,
          },
        });

        // 把建立成功的用户数据（不包含密码）和 JWT 回传给前端
        res
          .status(201)
          .setCookie('token', await signToken(user.id))
          .json({ ...user, passwordHash: undefined });

        // 处理完请求以后记得断开数据库链接
        await prisma.$disconnect();
      } catch (e: any) {
        // 如果发生未预期的错误，将对应的错误说明的 Prisma 文档发给用户
        res.status(500).json({
          result: false,
          message:
            typeof e.code === 'string'
              ? 'https://www.prisma.io/docs/reference/api-reference/error-reference#' +
                e.code.toLowerCase()
              : e,
        });
      }
      break;
    default:
      // 如果不是 POST 请求，代表他正在用错误的方式访问这个 API
      res.status(405).json({ error: 'Method not allowed' });
  }
}
```

完成开发后，可以使用 Postman 对这个 API 发起请求，测试功能是否正常运作。

### 用户登入

当用户对 `/api/login` 发起 `POST` 请求时，代表他们想要登入我们的博客网站并取得一个 JWT 令牌，这可以让他用于建立新文章。

:::info
这个部分留给读者练习，你可以在 [https://github.com/umijs/umi-blog-example/blob/main/src/api/login.ts](https://github.com/umijs/umi-blog-example/blob/main/src/api/login.ts) 找到这个示范的源代码！
:::

### 发表文章

当用户对 `/api/posts` 发起 `POST` 请求时，代表他们想要在我们的博客网站发表一篇文章。

:::info
这个部分留给读者练习，你可以在 [https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/index.ts](https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/index.ts) 找到这个示范的源代码！
:::

### 查询所有文章

当用户对 `/api/posts` 发起 `GET` 请求时，代表他们想要查询所有文章的数据。

:::info
这个部分留给读者练习，你可以在 [https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/index.ts](https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/index.ts) 找到这个示范的源代码！
:::

### 查询某篇文章

当用户对 `/api/posts/{postId}` 发起 `GET` 请求时，代表他们想要查询某篇文章的数据。

:::info
这个部分留给读者练习，你可以在 [https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/%5BpostId%5D.ts](https://github.com/umijs/umi-blog-example/blob/main/src/api/posts/%5BpostId%5D.ts) 找到这个示范的源代码！
:::

## 实作页面组件

在这个章节，我们主要要学习如何在页面组件调用 API，来实现获取文章或注册等前后端交互的行为：

```jsx
// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { history } from "umi";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>();
  return (
    <div>
      {!posts && <p>Loading...</p>}
      {posts && <div>
        {posts.map(post => <div key={post.id}>
          <div onClick={() => history.push(`/posts/${post.id}`)}>
            <p>{post.title}</p>
          </div>
        </div>)}
      </div>}
    </div>
  );
}
```

可以看到我们在首页组件维护了一个 `posts` 状态，当 `posts` 是 `undefined` 时，我们认为是数据尚未加载完成。所以我们可以加入一个 `useEffect`让他在组件加载后对 API 路由发起一个请求，去查询目前所有的文章列表：

```tsx
// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { history } from 'umi';

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>();

  async function refresh() {
    try {
      const res = await fetch('/api/posts');
      if (res.status !== 200) {
        console.error(await res.text());
      }
      setPosts(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      {!posts && <p>Loading...</p>}
      {posts && (
        <div>
          {posts.map((post) => (
            <div key={post.id}>
              <div onClick={() => history.push(`/posts/${post.id}`)}>
                <p>{post.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

可以看到我们加入了一个 `refresh` 函数，他会帮我们从 API 路由查询目前的文章列表。若你现在访问这个页面，应该可以看到一开始是 `Loading ...`
等一阵子就会有全部文章的标题被渲染出来的效果。

![titles](https://img.alicdn.com/imgextra/i1/O1CN01n3CA371n0PlgkdEvQ_!!6000000005027-2-tps-3104-1974.png)

最后只要帮他加一点样式：

![titles-with-style](https://img.alicdn.com/imgextra/i1/O1CN01sfpTVd1IGDLK068gY_!!6000000000865-2-tps-3104-1974.png)

---

其他页面留给读者实作，可以加入自己的想法及样式的设计来实现，源代码可参考：[https://github.com/umijs/umi-blog-example/blob/main/src/pages](https://github.com/umijs/umi-blog-example/blob/main/src/pages)

## 部署

最后，将你的项目提交到 git 服务上，然后登入 [Vercel](https://vercel.com):

![Vercel](https://img.alicdn.com/imgextra/i2/O1CN01X7LqFx1LbEMYzLT3k_!!6000000001317-2-tps-2720-1710.png)

如果你的项目代码是提交到 GitHub，那么建议你选择 GitHub 登入，这样你就可以在 Vercel 直接导入现有的代码仓库了 👍

![Vercel New Project](https://img.alicdn.com/imgextra/i1/O1CN014qIgle23G171pvX0V_!!6000000007227-2-tps-2720-1818.png)

导入以后，他会自动检测到这个项目是使用 Umi.js 框架搭建的，并且自动化完成相关的配置，因此直接点击 **Deploy** 即可开始部署！

![Deploy](https://img.alicdn.com/imgextra/i3/O1CN013Ts04x1tqyv4VhzbW_!!6000000005954-2-tps-1468-1064.png)等他部署完成以后，你的博客就正式上线啦 👍

---

但这个时候你会发现，网站内的 API 路由没有办法正常工作，这是因为他缺少了连线到数据库需要的环境变量。我们需要帮他配置一下：

![Settings](https://img.alicdn.com/imgextra/i1/O1CN01OYPPB61G61IKR8chz_!!6000000000572-2-tps-2632-1934.png)

在项目配置页面，下面有可以设置环境变量的地方：

![Env](https://img.alicdn.com/imgextra/i4/O1CN01nOLflV1I4lRMwsYHk_!!6000000000840-2-tps-2632-1934.png)

你可以把 `DATABASE_URL`, `JWT_KEY` 等等你用到的环境变量从这里传入。

![Redeploy](https://img.alicdn.com/imgextra/i3/O1CN013dlBGs2506aFTigki_!!6000000007463-2-tps-2644-1890.png)

加入环境变量以后，点击 **Redeploy** 重新部署一次版本，你的博客就能正常运作啦～
