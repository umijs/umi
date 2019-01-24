---
sidebarDepth: 2
---

# API

## 路由

### umi/link

通过声明的方式做路由跳转。

例子：

```markup
import Link from 'umi/link';

export default () => {
  <div>
    /* 普通使用 */
    <Link to="/list">Go to list page</Link>

    /* 带参数 */
    <Link to="/list?a=b">Go to list page</Link>

    /* 包含子组件 */
    <Link to="/list?a=b"><button>Go to list page</button></Link>
  </div>
}
```

### umi/router

通过编程的方式做路由切换，包含以下 4 个 API 。

#### router.push(path)

推一个新的页面到 history 里。

例子：

```js
import router from 'umi/router';

// 普通跳转，不带参数
router.push('/list');

// 带参数
router.push('/list?a=b');
router.push({
  pathname: '/list',
  query: {
    a: 'b',
  },
});
# 对象且不包含 pathname 会报错
router.push({
  query: {}
});
```

#### router.replace(path)

替换当前页面，参数和 [router.push()](#router.push\(path\)) 相同。

#### router.go(n)

往前或往后跳指定页数。

例子：

```js
import router from 'umi/router';

router.go(-1);
router.go(2);
```

#### router.goBack()

后退一页。

例子：

```js
import router from 'umi/router';
router.goBack();
```

### umi/navlink

详见：[https://reacttraining.com/react-router/web/api/NavLink](https://reacttraining.com/react-router/web/api/NavLink)

### umi/redirect

重定向用。

例子：

```js
import Redirect from 'umi/redirect';
<Redirect to="/login" />
```

详见：[https://reacttraining.com/react-router/web/api/Redirect](https://reacttraining.com/react-router/web/api/Redirect)

### umi/prompt

例子：

```js
import Prompt from 'umi/prompt';

export default () => {
  return (
    <>
      <h1>Prompt</h1>
      <Prompt
        when={true}
        message={(location) => {
          return window.confirm(`confirm to leave to ${location.pathname}?`);
        }}
      />
    </>
  );
}
```

详见：[https://reacttraining.com/react-router/web/api/Prompt](https://reacttraining.com/react-router/web/api/Prompt)

### umi/withRouter

详见：[https://reacttraining.com/react-router/web/api/withRouter](https://reacttraining.com/react-router/web/api/withRouter)

## 性能

### umi/dynamic

动态加载组件，基于 [react-loadable](https://github.com/jamiebuilds/react-loadable) 实现。

#### dynamic(options)

例子：

```js
import dynamic from 'umi/dynamic';

// 延时 1s 渲染的组件。
const App = dynamic({
  loader: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(() => <div>I will render after 1s</div>);
      }, /* 1s */1000);
    }));
  },
});

// 或者用 async 语法
const delay = (timeout) => new Promise(resolve => setTimeout(resolve, timeout));
const App = dynamic({
  loader: async function() {
    await delay(/* 1s */1000);
    return () => <div>I will render after 1s</div>;
  },
});
```

## 构建

### umi/babel

让用户可基于 umi 的 babel 配置进行扩展。
