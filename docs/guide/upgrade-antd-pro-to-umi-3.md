---
nav:
  title: Guide
---

# Upgrade Ant Design Pro to Umi 3


The migration to Umi 3 takes three steps, and the migration can be completed in less than 10 minutes:

1. **Dependency Handling** 
1. **Configuration layer migration**
1. **Code layer modification**

### Dependency Handling

The `package.json` of the project needs to upgrade umi and replace the corresponding umi plugin.

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

Execute `npm install` to reinstall dependencies.

### Configuration layer migration 

According to [Umi 3 Configuration](../config), there are **modified configuration items** as follows: `config/config.ts`:

```typescript
import { defineConfig, utils } from 'umi';

const { winPath } = utils;

export default defineConfig({
  // Automatically mount the umi plug-in through package.json, no need to mount again
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
    // No level, webpackChunkName configuration required 
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

### Code layer modification

Umi 3 adds `import from umi`, commonly used modules and tools can be directly imported from `umi`:

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

**Note:** It is not recommended to use formatMessage directly, it is recommended that you use [useIntl](/zh-CN/plugins/plugin-locale#useintl) or [injectIntl](https://github.com/formatjs/formatjs/blob /main/website/docs/react-intl/api.md#injectintl-hoc), the same function can be achieved.

Route jump uses `history`:

```diff
- import { router } from 'umi';
+ import { history } from 'umi';

- router.push()
+ history.push()
```

After the third step is completed, execute `npm run start`, visit [http://localhost:8000](http://localhost:8000), and access means that the migration is complete.

![](https://gw.alipayobjects.com/zos/antfincdn/MysqNKCYyc/ae1d7e2a-3b6e-49d8-8c0a-c306840932f6.png)

> For more migration details, see [PR](https://github.com/ant-design/ant-design-pro/pull/6039).
