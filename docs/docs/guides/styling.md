# 样式

本文介绍各种在 Umi 项目中使用样式的方式。

## 使用 CSS 样式

你可以在 Umi 项目中使用 `.css` 文件声明各种样式，然后在 `.js` 文件中引入即可生效。

例如，在 `src/pages/index.css` 文件按照以下代码声明 `.title` 类的样式为红色：

```css
.title {
  color: red;
}
```

然后在 `src/pages/index.js` 文件中引入即可生效。

```jsx
// src/pages/index.js

import './index.css';

export default function () {
  return <div className="title">Hello World</div>;
}
```

按照此种引入方式的样式会在整个 Umi 项目中生效，即无论你从哪个 `.js`
文件引入，他声明的样式可以在任何页面和组件中使用。如果你想要避免这种情况，可以使用 [CSS Modules](#使用-css-modules) 的功能来限制样式的作用域。

## 使用 CSS Modules

在 `js` 文件中引入样式时，如果赋予他一个变量名，就可以将样式以 CSS Module 的形式引入。

```jsx
// src/pages/index.js

import styles from './index.css';

export default function () {
  return <div className={styles.title}>
    Hello World
  </div>;
}
```

上面的示例中，`index.css` 文件中声明的样式不会对全局样式造成影响，只会对从 `styles` 变量中使用的样式生效。

## 使用 CSS 预处理器

Umi 默认支持 LESS (推荐), SASS 和 SCSS 样式的导入，你可以直接按照引入 CSS 文件的方式引入并使用这些由 CSS 预处理器处理的样式。

```jsx
// src/pages/index.js

import './index.less';
import './index.sass';
import './index.scss';

export default function () {
  return <div className="title">Hello World</div>;
}
```

同样也支持 CSS Module 的用法：

```jsx
// src/pages/index.js

import lessStyles from './index.less';
import sassStyles from './index.sass';
import scssStyles from './index.scss';

export default function () {
  return <div className={lessStyles.title}>
    Hello World
    <p className={sassStyles.blue}>I am blue</p>
    <p className={scssStyles.red}>I am red</p>
  </div>;
}
```

## 进阶设置

如果你需要使用除了常见的 LESS, SASS 或 SCSS 以外的其他样式预处理器，你可以透过 Umi
插件提供的 [chainWebpack 接口](../api/config#chainwebpack)来加入自己需要的 Loader。

## 使用 Tailwindcss

Umi 提供了内置的 [Tailwindcss](https://tailwindcss.com/)
插件，并且可以直接方便地使用 [微生成器](./generator#tailwind-css-配置生成器) 来启用。

## 使用 UnoCSS

与 Tailwindcss 相同，Umi 也提供了内置的 [UnoCSS](https://github.com/unocss/unocss) 插件，可以按照相同方式开启。

1. 安装 `plugin-unocss`
2. 安装 `unocss`及`@unocss/cli`

```bash
pnpm i unocss @unocss/cli
```

3. 在 Umi 设置中启用插件，并声明会用到 `unocss` 的文件目录

```js
// .umirc.ts 或 config/config.ts

export default {
  plugins: [
    require.resolve('@umijs/plugins/dist/unocss')
  ],
  unocss: {
    watch: ['pages/**/*.tsx'] // 添加其他包含 unocss 的 classname 的文件目录
  },
};
```

4. 在项目目录下加入 `unocss.config.ts`
   配置文件，并加入项目需要的 [UnoCSS Presets](https://github.com/unocss/unocss#presets)

```js
// unocss.config.ts

import {defineConfig, presetAttributify, presetUno} from 'unocss';

export function createConfig({strict = true, dev = true} = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build', presets: [presetAttributify({strict}), presetUno()],
  });
}

export default createConfig(); 
```

5. 启动项目进行开发，插件会监听设置文件中的 `unocss.watch` 字段，动态生成样式文件并自动套用
