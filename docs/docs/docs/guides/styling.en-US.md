---
order: 7
toc: content
translated_at: '2024-03-17T10:21:09.036Z'
---

# Styles

This document introduces various ways of using styles in Umi projects.

## Using CSS Styles

You can declare various styles in `.css` files in Umi projects, and then import them in `.js` files to make them effective.

For example, declare the style of the `.title` class as red in the `src/pages/index.css` file according to the following code:

```css
.title {
  color: red;
}
```

Then import it in the `src/pages/index.tsx` file to make it effective.

```jsx
// src/pages/index.tsx

import './index.css';

export default function () {
  return <div className="title">Hello World</div>;
}
```

The style imported in this way will be effective throughout the Umi project, i.e., regardless of which `.js`
file you import from, its declared style can be used on any page and component. If you want to avoid this situation, you can use the [CSS Modules](#using-css-modules) feature to limit the scope of the style.

## Using CSS Modules

When importing styles in `js` files, if you assign it a variable name, you can import the style as a CSS Module.

```jsx
// src/pages/index.tsx

import styles from './index.css';

export default function () {
  return <div className={styles.title}>
    Hello World
  </div>;
}
```

In the example above, the styles declared in the `index.css` file will not affect the global styles and will only be effective for styles used from the `styles` variable.

## Using CSS Preprocessors

Umi natively supports importing LESS (recommended), SASS, and SCSS styles. You can directly import and use these styles processed by CSS preprocessors in the same way as you import CSS files.

:::info{title=💡}
To use SASS (SCSS) in Umi, you need to install additional preprocessor dependencies, such as: `npm add -D sass`
:::

```jsx
// src/pages/index.tsx

import './index.less';
import './index.sass';
import './index.scss';

export default function () {
  return <div className="title">Hello World</div>;
}
```

CSS Module usage is also supported:

```jsx
// src/pages/index.tsx

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

Umi also provides built-in support for `.styl` and `.stylus` files. `stylus` related preprocessor dependency must be installed first. Other usage is similar to the examples above.

```bash
# .styl and .stylus
npm add -D stylus
```

## Advanced Settings

If you need to use other style preprocessors besides the common LESS, SASS, or SCSS, you can add your own Loader through the [chainWebpack interface](../api/config#chainwebpack) provided by Umi plugins.

## Using Tailwindcss

Umi provides an internal [Tailwindcss](https://tailwindcss.com/)
plugin, and you can easily enable it using the [Micro-generator](./generator#tailwind-css-configuration-generator).

## Using UnoCSS

Similar to Tailwindcss, Umi also provides an internal [UnoCSS](https://github.com/unocss/unocss) plugin, which can be enabled in the same way.

1. Install `plugin-unocss`
2. Install `unocss` and `@unocss/cli`

```bash
pnpm i unocss @unocss/cli
```

3. Enable the plugin in Umi settings and declare the file directory where `unocss` will be used

```js
// .umirc.ts

export default {
  plugins: [
    require.resolve('@umijs/plugins/dist/unocss')
  ],
  unocss: {
    // Range of files to detect className, if the project does not include the src directory, use `pages/**/*.tsx`
    watch: ['src/**/*.tsx']
  },
};
```

4. Add a `unocss.config.ts`
   configuration file in the project directory and include the [UnoCSS Presets](https://github.com/unocss/unocss#presets) needed by the project

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

5. Start the project for development. The plugin will listen to the `unocss.watch` field in the settings file, dynamically generate style files, and automatically apply them.
