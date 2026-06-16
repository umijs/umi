---
order: 16
toc: content
---
# Tailwind CSS 插件

在 Max 项目使用 Tailwind CSS 功能。

## 配置

使用微生成器一键开启 Tailwind CSS 插件

Max 项目

```bash
npx max g tailwindcss
info  - Update package.json for devDependencies
set config:tailwindcss on /project/max-playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

Umi 项目

```bash
npx umi g tailwindcss
info  - Update package.json for devDependencies
set config:tailwindcss on /project/max-playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

至此就可以在项目中使用 Tailwind CSS 的样式；项目根目录的 `tailwind.config.js` 和 `tailwind.css` 根据需要修改配置。

## Tailwind CSS v4

当项目使用 webpack 或 utoopack，并启用 Tailwind CSS v4 时，插件会使用内置的 `@tailwindcss/webpack` loader 处理项目根目录的 `tailwind.css`，不再启动 Tailwind CLI 子进程。项目只需要安装 Tailwind CSS。

```bash
npm i tailwindcss
```

`tailwind.css` 可以使用 Tailwind CSS v4 的 CSS-first 写法。

```css
@import 'tailwindcss';

@source './src/**/*.{js,jsx,ts,tsx}';
```

## Env

在项目根目录添加 `.env` 文件，添加 `CHECK_TIMEOUT` 变量，用于设置 Tailwind CSS 插件的检查间隔时间。

```bash
# Default: 5
CHECK_TIMEOUT=10
```
