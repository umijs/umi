# 微生成器

umi 中内置了众多微生成器，协助你在开发中快速的完成一些繁琐的工作。

## 如何使用

下面的命令会列出目前所有可用的生成器，可以通过交互式方式来选择你使用的功能，都有详细的提示。

```bash
$ umi generate
# 或者
$ umi g
```

你也可以通过 `umi g <generatorName>` 的形式来使用对应的生成器。

## 生成器列表

### 页面生成器

快速生成一个新页面，有以下使用方式。

交互式输入页面名称和文件生成方式：

```bash
$umi g page
? What is the name of page? › mypage
? How dou you want page files to be created? › - Use arrow-keys. Return to submit.
❯   mypage/index.{tsx,less}
    mypage.{tsx,less}
```

直接生成：

```bash
$umi g page foo
Write: src/pages/foo.tsx
Write: src/pages/foo.less
```

以目录方式生成页面，目录下为页面的组件和样式文件：

```bash
$umi g page bar --dir
Write: src/pages/bar/index.less
Write: src/pages/bar/index.tsx
```

嵌套生成页面：

```bash
$umi g page far/far/away/kingdom
info  - @local
Write: src/pages/far/far/away/kingdom.tsx
Write: src/pages/far/far/away/kingdom.less
```

批量生成多个页面：

```bash
$umi g page  page1  page2   a/nested/page3
info  - @local
Write: src/pages/page1.tsx
Write: src/pages/page1.less
Write: src/pages/page2.tsx
Write: src/pages/page2.less
Write: src/pages/a/nested/page3.tsx
Write: src/pages/a/nested/page3.less
```

### 组件生成器

在 `src/components/` 目录下生成项目需要的组件。和页面生成器一样，组件生成器也有多种生成方式。

交互式生成：
```bash
$umi g component
info  - @local
✔ Please input you component Name … foo
Write: src/components/Foo/index.ts
Write: src/components/Foo/Foo.tsx
```

直接生成：
```bash
$umi g component bar
info  - @local
Write: src/components/Bar/index.ts
Write: src/components/Bar/Bar.tsx
```

嵌套生成：
```bash
$umi g component group/subgroup/baz
info  - @local
Write: src/components/group/subgroup/Baz/index.ts
Write: src/components/group/subgroup/Baz/Baz.tsx
```

批量生成：
```bash
$umi g component apple banana orange
info  - @local
Write: src/components/Apple/index.ts
Write: src/components/Apple/Apple.tsx
Write: src/components/Banana/index.ts
Write: src/components/Banana/Banana.tsx
Write: src/components/Orange/index.ts
Write: src/components/Orange/Orange.tsx
```

### RouteAPI 生成器

生成 routeAPI 功能的模板文件。

交互式生成：
```bash
$umi g api
info  - @local
✔ please input your api name: … starwar/people
Write: api/starwar/people.ts
```

直接生成:
```bash
$umi g api films
info  - @local
Write: api/films.ts
```

嵌套生成器：
```bash
$umi g api planets/[id]
info  - @local
Write: api/planets/[id].ts
```

批量生成：
```bash
$umi g api spaceships vehicles species
info  - @local
Write: api/spaceships.ts
Write: api/vehicles.ts
Write: api/species.ts
```

### Mock 生成器

生成 [Mock](./mock) 功能的模板文件，mock 的具体实现参考[文档](./mock)。

交互式生成：
```bash
$umi g mock
info  - @local
✔ please input your mock file name … auth
Write: mock/auth.ts
```

直接生成:
```bash
$umi g mock acl
info  - @local
Write: mock/acl.ts
```

嵌套生成:
```bash
$umi g mock users/profile
info  - @local
Write: mock/users/profile.ts
```

### Prettier 配置生成器

为项目生成 [prettier](https://prettier.io/) 配置，命令执行后，umi 会生成推荐的 prettier 配置和安装相应的依赖。

```bash
$umi g prettier
info  - @local
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
```

### Jest 配置生成器

为项目生成 [jest](https://jestjs.io/) 配置，命令执行后，umi 会生成 jest 配置和安装相应的依赖。根据需要选择是否要使用 [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) 做 UI 测试。

```bash
$umi g jest
info  - @local
✔ Will you use @testing-library/react for UI testing?! … yes
info  - Write package.json
info  - Write jest.config.ts
```

### Tailwind CSS 配置生成器

为项目开启 [Tailwind CSS](https://tailwindcss.com/) 配置，命令执行后，umi 会生成 Tailwind CSS 和安装相应的的依赖。

```bash
$umi g tailwindcss
info  - @local
info  - Write package.json
set config:tailwindcss on /Users/umi/umi-playground/.umirc.ts
set config:plugins on /Users/umi/umi-playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

### DvaJS 配置生成器

为项目开启 [Dva](https://dvajs.com/) 配置，命令执行后，umi 会生成 Dva 

```bash
$umi g dva
info  - @local
set config:dva on /Users/umi/umi-playground/.umirc.ts
set config:plugins on /Users/umi/umi-playground/.umirc.ts
info  - Update config file
info  - Write example model
```
