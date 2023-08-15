import { Message } from 'umi';

# Styling

This article introduces various ways to use styles in Umi projects.

## Using CSS Styles

You can declare various styles in `.css` files in your Umi project and then import them in `.js` files to make them effective.

For example, in the `src/pages/index.css` file, declare the `.title` class's style to be red:

```css
.title {
  color: red;
}
```

Then, import it in the `src/pages/index.tsx` file to apply the style:

```jsx
// src/pages/index.tsx

import './index.css';

export default function () {
  return <div className="title">Hello World</div>;
}
```

Using this import method, the style will be applied throughout the entire Umi project. It means that the styles declared in one `.js` file can be used in any page or component. If you want to avoid this behavior, you can use the [CSS Modules](#using-css-modules) feature to limit the scope of the styles.

## Using CSS Modules

When importing styles in `js` files, you can import them as CSS Modules by assigning them a variable name.

```jsx
// src/pages/index.tsx

import styles from './index.css';

export default function () {
  return <div className={styles.title}>
    Hello World
  </div>;
}
```

In the example above, the styles declared in the `index.css` file will not affect global styles; they will only be applied to the styles used from the `styles` variable.

## Using CSS Preprocessors

Umi supports importing styles processed by CSS preprocessors like LESS (recommended), SASS, and SCSS. You can import and use these styles just like importing CSS files.

<Message emoji="💡">
To use Sass(Scss) in Umi, you need to install the preprocessor dependencies additionally, such as `npm add -D sass`.
</Message>

```jsx
// src/pages/index.tsx

import './index.less';
import './index.sass';
import './index.scss';

export default function () {
  return <div className="title">Hello World</div>;
}
```

CSS Modules usage is also supported:

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

## Advanced Settings

If you need to use a CSS preprocessor other than the commonly used LESS, SASS, or SCSS, you can add the necessary loaders using the [chainWebpack interface](../api/config#chainwebpack) provided by Umi plugins.

## Using Tailwind CSS

Umi provides a built-in [Tailwind CSS](https://tailwindcss.com/) plugin, and you can easily enable it using the [scaffolding generator](./generator#tailwind-css-配置生成器).

## Using UnoCSS

Similar to Tailwind CSS, Umi also offers a built-in [UnoCSS](https://github.com/unocss/unocss) plugin, which can be enabled in the same manner.

1. Install the `plugin-unocss` plugin.
2. Install `unocss` and `@unocss/cli`.

```bash
pnpm i unocss @unocss/cli
```

3. Enable the plugin in the Umi configuration and specify the directory where `unocss` will be used.

```js
// .umirc.ts

export default {
  plugins: [
    require.resolve('@umijs/plugins/dist/unocss')
  ],
  unocss: {
    // Specify the file scope to check className. If your project doesn't contain the src directory, you can use `pages/**/*.tsx`.
    watch: ['src/**/*.tsx']
  },
};
```

4. Add the `unocss.config.ts` configuration file to your project directory and include the necessary [UnoCSS Presets](https://github.com/unocss/unocss#presets).

```js
// unocss.config.ts

import { defineConfig, presetAttributify, presetUno } from 'unocss';

export function createConfig({ strict = true, dev = true } = {}) {
  return defineConfig({
    envMode: dev ? 'dev' : 'build',
    presets: [presetAttributify({ strict }), presetUno()],
  });
}

export default createConfig();
```

5. Start your project for development, and the plugin will monitor the `unocss.watch` field in the settings file, dynamically generate style files, and apply them automatically.