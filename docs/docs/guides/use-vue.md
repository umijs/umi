import { Message } from 'umi';

# Using Vue

This document explains how to use Vue with Umi. Most of the Umi Vue configuration is similar to React, so we will focus on Vue-specific configurations.

## Getting Started

### Installation

```bash
pnpm add  @umijs/preset-vue -D
```

### Configuring the Preset

```ts
// .umirc.ts or config/config.ts
export default {
  presets: [require.resolve('@umijs/preset-vue')],
};

```

## Routing

### Configuration-Based Routing

<Message>
Here, we only list the differences in routing configuration compared to React.
</Message>

#### Name

Named Routes

In addition to `path`, you can provide a `name` for any route:

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

To link to a named route, you can pass an object to the `to` prop of the `router-link` component:

```html
<router-link :to="{ name: 'user', params: { username: 'erina' }}">
  User
</router-link>
```

This is equivalent to programmatically calling `router.push`:

```ts
router.push({ name: 'user', params: { username: 'erina' } });
```

Both methods will navigate to the path `/user/erina`.

#### Redirect

Redirects are also achieved through the `routes` configuration. The following example redirects from `/home` to `/`:

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

The target of the redirect can also be a named route:

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

#### Alias

A redirect means that when a user visits `/home`, the URL is replaced with `/`, which is then matched as `/`. So, what is an alias?

Alias `/` as `/home`. This means that when a user visits `/home`, the URL remains `/home`, but it's matched as if the user is visiting `/`.

The corresponding route configuration is as follows:

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

With aliases, you can freely map UI structures to arbitrary URLs, regardless of the configured nested structure. Prefix the alias with `/` to make nested paths absolute. You can even combine the two by providing multiple aliases in an array:

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
      ],
    },
  ],
};
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

For more details, see the [Vue Router documentation on composition API](https://router.vuejs.org/guide/advanced/composition-api.html#accessing-the-router-and-current-route-inside-setup).

### router-link

[See Vue Router documentation on router-link](https://router.vuejs.org/guide/#router-link).

### router-view

[See Vue Router documentation on router-view](https://router.vuejs.org/guide/#router-view).

## Runtime Configuration

You can control Vue and Vue Router-related configurations by exporting configuration from `src/app.tsx` using the `export` syntax.

### router

Configure routing behavior:

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

Callback function called when the Vue app is mounted. You can get the app instance and router instance here, allowing you to register global components and set up router interceptors, among other things.

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

Modify the root component that vue-router renders.

For example, you can wrap it with a parent component:

```ts
import { h } from 'vue'

export function rootContainer(container) {
  return h(ThemeProvider, null, container);
}
```

## Examples

For more examples, refer to the demos:

* [boilerplate-vue](https://github.com/umijs/umi/tree/master/examples/boilerplate-vue)
* [with-vue-pinia](https://github.com/umijs/umi/tree/master/examples/with-vue-pinia)
* [with-vue-element-plus](https://github.com/umijs/umi/tree/master/examples/with-vue-element-plus)
