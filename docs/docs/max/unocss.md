import { Tabbed, Message } from 'umi';

# Uno CSS 插件

在 Max 项目使用 Uno CSS 功能。

## 配置

使用微生成器一键开启 Uno CSS 插件

<Tabbed>

Max 项目

```bash
npx max g unocss
info  - Update package.json for devDependencies
set config:unocss on /.umirc.ts
set config:plugins on /.umirc.ts
info  - Update .umirc.ts
info  - Write uno.config.ts
```

Umi 项目

```bash
npx umi g unocss
info  - Update package.json for devDependencies
set config:unocss on /.umirc.ts
set config:plugins on /.umirc.ts
info  - Update .umirc.ts
info  - Write uno.config.ts
```

</Tabbed>

至此就可以在项目中使用 Uno CSS 的样式；项目根目录的 `uno.config.js` 根据需要修改配置。
