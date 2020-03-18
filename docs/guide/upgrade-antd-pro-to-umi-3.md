---
nav:
  title: Guide
translateHelp: true
---

# Upgrade Antd Pro to Umi 3


Migrating to Umi 3 is a three-step process that can be completed in less than 10 minutes:

1. **Dependency handling**
1. **Configuration Layer Migration**
1. **Code Layer Modification**

### Dependency Handling 

Modify `package.json` upgrading umi，and removing umi plugins.

```diff
{
  "dependencies": {
-   "dva": "^2.6.0-beta.16",
  },
  "devDependencies": {
-   "umi": "^2.13.0",
-   "umi-types": "^0.5.9"
-   "umi-plugin-react": "^1.14.10",
-   "umi-plugin-ga": "^1.1.3",
-   "umi-plugin-pro": "^1.0.2",
-   "umi-plugin-antd-icon-config": "^1.0.2",
-   "umi-plugin-antd-theme": "^1.0.1",
-   "umi-plugin-pro-block": "^1.3.2",
+   "umi": "^3.0.0",
+   "@umijs/preset-react": "^1.2.2"
  }
}
```

Run `npm install` to reinstall the dependencies.

### Configuration Layer Migration

根据 [Umi 3 配置](../config) ，有**修改的配置项**如下 `config/config.ts` ：

```typescript
import { defineConfig, utils } from 'umi';

const { winPath } = utils;

export default defineConfig({
  // Automatically mount the umi plugin through package.json, no need to mount again
  // plugins: [],
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    baseNavigator: true,
  },
  dynamicImport: {
    // No level required, webpackChunkName configuration
    // loadingComponent: './components/PageLoading/index'
    loading: '@/components/PageLoading/index',
  },
  // Temporarily closed
  pwa: false,
  lessLoader: { javascriptEnabled: true },
  cssLoader: {
    // The modules here can accept getLocalIdent
    modules: {
      getLocalIdent:(
        context: {
          resourcePath: string;
        },
        _: string,
        localName: string,
      ) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }
        const match = context.resourcePath.match(/src(.*)/);
        if (match && match[1]) {
          const antdProPath = match[1].replace('.less', '');
          const arr = winPath(antdProPath)
            .split('/')
            .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
            .map((a: string) => a.toLowerCase());
          return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
        }
        return localName;
      },
    }
  }
})
```

### Code Layer Modification

Umi 3 adds `import from umi`. Common modules and tools can be imported directly from `umi`:

```diff
- import Link from 'umi/link';
- import { connect } from 'dva';
- import { getLocale, setLocale, formatMessage } from 'umi-plugin-react/locale';
+ import {
+   Link,
+   connect,
+   getLocale,
+   setLocale,
+   formatMessage,
+ } from 'umi';
```

**Note:** It is not recommended to use formatMessage directly. It is recommended that you use [useIntl](/zh-CN/plugins/plugin-locale#useintl) or [injectIntl](https://github.com/formatjs/react-intl/blob/master/docs/API.md#injectintl-hoc) to achieve the same function.

Route redirection uses `history`:

```diff
- import { router } from 'umi';
+ import { history } from 'umi';

- router.push()
+ history.push()
```

After the third step is completed, execute `npm run start` and access [http://localhost:8000](http://localhost:8000). If you can access it, the migration is complete.

![](https://gw.alipayobjects.com/zos/antfincdn/MysqNKCYyc/ae1d7e2a-3b6e-49d8-8c0a-c306840932f6.png)

> See [PR](https://github.com/ant-design/ant-design-pro/pull/6039) for more migration details.
