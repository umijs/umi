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
