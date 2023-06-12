---
nav:
  title: Docs
  order: -1
group:
  title: Guides
  order: 3
order: 17
toc: content
---

# 使用 Vue

本文介绍如何在 Umi 使用 Vue , Umi Vue 大部分配置和 React 相同，这里只列出一些 Vue 独有的配置

## 启动方式

### 安装

```bash
pnpm add  @umijs/preset-vue -D
```

### 配置预设

```ts
// .umirc.ts or config/config.ts 中
export default {
  presets: [require.resolve('@umijs/preset-vue')],
};
```

## 路由

### 配置式路由

:::info{title=💡}
这里仅列出和 React 路由配置差异部分
:::

#### name

命名路由

除了 `path` 之外，你还可以为任何路由提供 `name`

```ts
export default {
  routes: [
    {
      path: '/user/:username',
      name: 'user',
      component: 'index',
    },
  ],
};
```

要链接到一个命名的路由，可以向 `router-link` 组件的 to 属性传递一个对象：

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

效果和命令式地调用 `router.push` 一致：

```ts
router.push({ name: 'user', params: { username: 'erina' } });
```

在这方法都能导航到路径 `/user/erina`。

#### redirect

重定向也是通过 `routes` 配置来完成，下面例子是从 `/home` 重定向到 `/`：

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: '/',
    },
  ],
};
```

重定向的目标也可以是一个命名的路由：

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: {
        name: 'homepage',
      },
    },
  ],
};
```

#### alias

重定向是指当用户访问 `/home` 时，URL 会被 `/` 替换，然后匹配成 `/`。那么什么是别名呢？

将 `/` 别名为 `/home`，意味着当用户访问 `/home` 时，URL 仍然是 `/home`，但会被匹配为用户正在访问 `/`。

上面对应的路由配置为：

```ts
export default {
  routes: [
    {
      path: '/',
      component: 'index',
      alias: '/home',
    },
  ],
};
```

通过别名，你可以自由地将 UI 结构映射到一个任意的 URL，而不受配置的嵌套结构的限制。使别名以 `/` 开头，以使嵌套路径中的路径成为绝对路径。你甚至可以将两者结合起来，用一个数组提供多个别名：

```ts
export default {
  routes: [
    {
      path: '/users',
      component: 'users',
      routes: [
        // 为这 3 个 URL 呈现 UserList
        // - /users
        // - /users/list
        // - /people
        { path: '', component: '/users/UserList', alias: ['/people', 'list'] },
      ],
    },
  ],
};
```

### 页面跳转

```html
<script lang="ts" setup>
  import { useRouter, useRoute } from 'umi';

  const router = useRouter();
  const route = useRoute();

  const onHello = () => {
    router.push({
      name: 'search',
      query: {
        ...route.query,
      },
    });
  };
</script>
```

更多[详见](https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup)

### router-link

[详见](https://router.vuejs.org/guide/#router-link)

### router-view

[详见](https://router.vuejs.org/guide/#router-view)

## 运行时配置

可以通过在约定的 `src/app.tsx` 通过 export 配置来控制 vue vue-router 相关的配置

### router

配置路由配置

```ts
// src/app.tsx
export const router: RouterConfig = {
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
```

### onMounted(\{app, router\})

Vue app mount 成功回调, 这里可以拿到 app 的实例及 router 的实例, 可以进行全局组件注册, 路由拦截器等。

```ts
export function onMounted({ app, router }: any) {
  console.log('onMounted', app, router);
  app.provide('umi-hello', {
    h: 'hello',
    w: 'word',
  });
}
```

### rootContainer(container)

修改交给 vue-router 渲染时的根组件。

比如用于在外面包一个父组件

```ts
import { h } from 'vue';

export function rootContainer(container) {
  return h(ThemeProvider, null, container);
}
```

## examples

更多详见 demo

- [boilerplate-vue](https://github.com/umijs/umi/tree/master/examples/boilerplate-vue)
- [with-vue-pinia](https://github.com/umijs/umi/tree/master/examples/with-vue-pinia)
- [with-vue-element-plus](https://github.com/umijs/umi/tree/master/examples/with-vue-element-plus)
