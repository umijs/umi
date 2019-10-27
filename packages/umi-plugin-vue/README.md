# umi-plugin-vue

## 配置

**.umirc.js**

`umi-plugin-vue` 插件默认配置

```js
export default {
  plugins: [
    [
      'umi-plugin-vue',
      {
        vuex: {
        },
        routes: {
          exclude: [/model/],
        },
        dll: {
          include: []
        },
        dynamicImport: {
          webpackChunkName: true
        }
      }
    ]
  ]
};
```


## 扩展API

当使用本插件后，`umi`项目中会新增一个API: `umi-vue`

```html
<template>
  <div>
    Hello, {{ isAuth }} {{ name }}! <br />
    <button @click="onClick">touch me</button>
  </div>
</template>
<script>
import { mapState, dispatch } from 'umi-vue'
export default {
  computed: {
    ...mapState({
      isAuth: state => state.model.isAuth,
    }),
    ...mapState('model',[
      'name'
    ])
  },
  methods: {
    onClick() {
      dispatch({type:'model/logout'})
    },
  },
};
</script>
```

```javascript
export default {
  namespace: 'model',
  state: {
    isAuth: false,
    name: 'didi',
  },
  reducers: {
    changeAuth(state) {
      state.isAuth  = true;
    },
  },
  effects: {
    *logout(_, { call, put }) {
      yield put({
        type: 'changeAuth',
      });
    },
  },
};

```



