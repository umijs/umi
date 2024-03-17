---
order: 17
toc: content
translated_at: '2024-03-17T09:57:48.935Z'
---

# Using Vue

This article introduces how to use Vue in Umi, where most of the configuration for Umi Vue is the same as React. Here we only list some configurations unique to Vue.

## How to Start

### Installation

```bash
pnpm add @umijs/preset-vue -D
```

### Configure Preset

```ts
// In .umirc.ts or config/config.ts
export default {
  presets: [require.resolve('@umijs/preset-vue')],
};
```

## Routing

### Config-based Routing

:::info
Here, we only list the parts that are different from React router configuration.
:::

#### name

Named routes

In addition to `path`, you can provide a `name` for any route:

```ts
export default {
  routes: [
    {
      path: '/user/:username',
      name: 'user',
      component: 'index'
    }
  ]
}
```

To link to a named route, you can pass an object to the `to` property of the `router-link` component:

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

The effect is the same as imperatively calling `router.push`:

```ts
router.push({ name: 'user', params: { username: 'erina' } })
```

Both methods navigate to the path `/user/erina`.

#### redirect

You also use the `routes` configuration for redirections; for example, redirecting from `/home` to `/`:

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: '/'
    }
  ]
}
```

The target of the redirect can also be a named route:

```ts
export default {
  routes: [
    {
      path: '/home',
      redirect: {
        name: 'homepage'
      }
    }
  ]
}
```

#### alias

Redirect means that when a user accesses `/home`, the URL will be replaced with `/` and then matched to `/`. But what is an alias?

Aliasing `/` to `/home` means that when the user visits `/home`, the URL still is `/home`, but it will be matched as if the user is visiting `/`.

The corresponding route configuration is:
```ts
export default {
  routes: [
    {
      path: '/',
      component: 'index',
      alias: '/home'
    }
  ]
}
```

With aliases, you are free to map your UI structure to any URL without being constrained by the nesting structure of the configuration. Make aliases start with `/` to turn nested paths into absolute paths. You can even combine the two by providing multiple aliases with an array:

```ts
export default {
  routes: [
    {
      path: '/users',
      component: 'users',
      routes: [
        // Render UserList for these 3 URLs
        // - /users
        // - /users/list
        // - /people
        { path: '', component: '/users/UserList', alias: ['/people', 'list'] },
      ]
    }
  ]
}
```

### Page Navigation

```html
<script lang="ts" setup>
import { useRouter, useRoute } from 'umi';

const router = useRouter()
const route = useRoute()

const onHello = () => {
  router.push({
    name: 'search',
    query: {
      ...route.query,
    },
  })
}
</script>
```

For more details, [see here](https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup)

### router-link

For more details, [see here](https://router.vuejs.org/guide/#router-link)

### router-view

For more details, [see here](https://router.vuejs.org/guide/#router-view)

## Runtime Configuration

You can control Vue and Vue-router related configuration through exporting settings in the conventional `src/app.tsx`.

### router

Configure router settings

```ts
// src/app.tsx
export const router: RouterConfig = {
  // @ts-ignore
  scrollBehavior(to, from) {
    console.log('scrollBehavior', to, from);
  },
};
```

### onMounted({app, router})

Callback for successful Vue app mount, where you can get instances of app and router for global component registration, route interceptors, etc.

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

Modify the root component rendered by vue-router.

For example, to wrap a parent component around the outside

```ts
import { h } from 'vue'

export function rootContainer(container) {
  return h(ThemeProvider, null, container);
}
```

## Examples

For more examples, see demos:

* [boilerplate-vue](https://github.com/umijs/umi/tree/master/examples/boilerplate-vue)
* [with-vue-pinia](https://github.com/umijs/umi/tree/master/examples/with-vue-pinia)
* [with-vue-element-plus](https://github.com/umijs/umi/tree/master/examples/with-vue-element-plus)
