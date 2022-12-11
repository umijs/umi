# 微生成器

Umi 中内置了众多微生成器，协助你在开发中快速的完成一些繁琐的工作。

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
Write: src/pages/far/far/away/kingdom.tsx
Write: src/pages/far/far/away/kingdom.less
```

批量生成多个页面：

```bash
$umi g page  page1  page2   a/nested/page3
Write: src/pages/page1.tsx
Write: src/pages/page1.less
Write: src/pages/page2.tsx
Write: src/pages/page2.less
Write: src/pages/a/nested/page3.tsx
Write: src/pages/a/nested/page3.less
```

#### 对页面模板内容进行自定义

如果页面生成器使用的默认模板不符合你的需求，你可以选择对模板内容进行自定义设置。

首先，执行 `--eject` 命令：

```bash
$umi g page --eject
```

执行命令后，页面生成器会把它的原始模板弹射到项目的 `/templates/page` 目录：

```
.
├── node_modules
│   └── ...
├── package.json
└── templates
    └── page
        ├── index.less.tpl
        └── index.tsx.tpl
```

接下来，你就可以对页面生成器的模板进行想要的修改了。

`--eject` 命令只是把页面生成器的原始模板拷贝到项目目录中，你也可以选择自己在 `/templates/page` 目录新建 `index.tsx.tpl` 和 `index.less.tpl` 文件，而不是使用 `--eject` 命令。在你的自定义模板目录内，并不需要两个模板文件都存在，如果某一个缺失，将会使用默认的模板来填充。

两个模板文件都支持模板语法，你可以像下面这样插入变量：

```tsx
// filename: index.tsx.tpl
import React from 'react';
{{#importAntd}}
import Antd from 'antd';
{{/importAntd}}
import './{{{name}}}.less'

const message = '{{{msg}}}'
const count = {{{count}}}
console.log(message);
console.log(count);
```

在上面这段代码中，我们使用了 `msg` 、 `count`、`importAntd` 和 `name` 四个变量，接下来，我们执行生成页面的命令：

```bash
$umi g page foo --msg "Hello World" --count 10 --importAntd
```

运行命令后，生成的页面内容如下：

```tsx
// filename: index.tsx.tpl
import React from 'react';
import Antd from 'antd';
import './foo.less'

const message = 'Hello World'
const count = 10
console.log(message);
console.log(count);
```

除了看到页面中成功生成了自定义内容以外，还可以看到，我们并没有指定 `name` 的值，但它被还是设置值了。这是因为它属于模板中预设的变量，下面是目前模板所有的预设变量：

1. `name`。当前文件的名称。举一个例子，执行 `pnpm umi g page foo`，会生成 `pages/foo.tsx` 和 `pages/foo.less` 两个文件，其中 `name` 的值为 "foo" 。
2. `color`。随机生成一个颜色，比如：`rgb(121, 242, 147)` 。
3. `cssExt`。样式文件的后缀名，默认为 `less` 。

如果想了解更多模板语法的内容，请查看 [mustache](https://www.npmjs.com/package/mustache)。

如果你的模板文件需要语法高亮，并且不需要使用模板变量，你可以省略 `.tpl` 后缀名，比如 `index.tsx.tpl` 可以简写为 `index.tsx`，`index.less.tpl` 可以简写为 `index.less`。

页面生成器有 `dir` 模式，它的生成规则会和你的页面自定义模板文件夹保持一致，只有在页面自定义模板文件夹为空时才使用默认模板。也就是说，如果你的页面自定义模板文件夹内容如下：

```
.
├── a.tsx
├── b.tsx
└── index.tsx.tpl
```

此时生成的目录将是：

```
.
├── a.tsx
├── b.tsx
└── index.tsx
```

如果还想继续使用默认的模板，可以指定 `--fallback`，此时不再使用用户自定义的模板：

```bash
$umi g page foo --fallback
```

### 组件生成器

在 `src/components/` 目录下生成项目需要的组件。和页面生成器一样，组件生成器也有多种生成方式。

交互式生成：
```bash
$umi g component
✔ Please input you component Name … foo
Write: src/components/Foo/index.ts
Write: src/components/Foo/Foo.tsx
```

直接生成：
```bash
$umi g component bar
Write: src/components/Bar/index.ts
Write: src/components/Bar/Bar.tsx
```

嵌套生成：
```bash
$umi g component group/subgroup/baz
Write: src/components/group/subgroup/Baz/index.ts
Write: src/components/group/subgroup/Baz/Baz.tsx
```

批量生成：
```bash
$umi g component apple banana orange
Write: src/components/Apple/index.ts
Write: src/components/Apple/Apple.tsx
Write: src/components/Banana/index.ts
Write: src/components/Banana/Banana.tsx
Write: src/components/Orange/index.ts
Write: src/components/Orange/Orange.tsx
```

#### 对组件模板内容进行自定义

和页面生成器一样，如果组件生成器使用的默认模板不符合你的需求，你也可以对模板内容进行自定义设置。

首先，执行 `--eject` 命令：


```bash
$umi g component --eject
```

执行命令后，组件生成器会把它的原始模板弹射到项目的 `/templates/component` 目录：

```
.
├── node_modules
│   └── umi -> ...
├── package.json
└── templates
    └── component
        ├── component.tsx.tpl
        └── index.ts.tpl  
```

组件生成器的模板语法规则和页面生成器的 [自定义模板](#对页面模板内容进行自定义) 一致。所以，你依然可以使用如下的方式写入模板变量：

```bash
$umi g component foo --msg "Hello World"
```

组件模板预设的变量和页面模板不同，它只有一个：`compName`，也就是当前组件的名称。如果执行 `pnpm umi g component foo`，此时 `compName` 的值为 `Foo`。

如果你的自定义模板文件需要语法高亮，并且不需要使用模板变量，你可以省略 `.tpl` 后缀名。比如 `index.ts.tpl` 可以简写为 `index.ts`，`component.tsx.tpl` 可以简写为 `component.tsx`。


如果还想继续使用默认的模板，可以指定 `--fallback`，此时不再使用用户自定义的模板：

```bash
$umi g component foo --fallback
```

### RouteAPI 生成器

生成 routeAPI 功能的模板文件。

交互式生成：
```bash
$umi g api
✔ please input your api name: … starwar/people
Write: api/starwar/people.ts
```

直接生成:
```bash
$umi g api films
Write: api/films.ts
```

嵌套生成器：
```bash
$umi g api planets/[id]
Write: api/planets/[id].ts
```

批量生成：
```bash
$umi g api spaceships vehicles species
Write: api/spaceships.ts
Write: api/vehicles.ts
Write: api/species.ts
```

### Mock 生成器

生成 [Mock](./mock) 功能的模板文件，mock 的具体实现参考[文档](./mock)。

交互式生成：
```bash
$umi g mock
✔ please input your mock file name … auth
Write: mock/auth.ts
```

直接生成:
```bash
$umi g mock acl
Write: mock/acl.ts
```

嵌套生成:
```bash
$umi g mock users/profile
Write: mock/users/profile.ts
```

### Prettier 配置生成器

为项目生成 [prettier](https://prettier.io/) 配置，命令执行后，`umi` 会生成推荐的 prettier 配置和安装相应的依赖。

```bash
$umi g prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
```

### Jest 配置生成器

为项目生成 [jest](https://jestjs.io/) 配置，命令执行后，`umi` 会生成 Jest 配置和安装相应的依赖。根据需要选择是否要使用 [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) 做 UI 测试。

```bash
$umi g jest
✔ Will you use @testing-library/react for UI testing?! … yes
info  - Write package.json
info  - Write jest.config.ts
```

### Tailwind CSS 配置生成器

为项目开启 [Tailwind CSS](https://tailwindcss.com/) 配置，命令执行后，`umi` 会生成 Tailwind CSS 和安装相应的的依赖。

```bash
$umi g tailwindcss
info  - Write package.json
set config:tailwindcss on /Users/umi/playground/.umirc.ts
set config:plugins on /Users/umi/playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

### DvaJS 配置生成器

为项目开启 [Dva](https://dvajs.com/) 配置，命令执行后，`umi` 会生成 Dva 

```bash
$umi g dva
set config:dva on /Users/umi/umi-playground/.umirc.ts
set config:plugins on /Users/umi/umi-playground/.umirc.ts
info  - Update config file
info  - Write example model
```

### Precommit 配置生成器

为项目生成 [precommit](https://typicode.github.io/husky) 配置，命令执行后，`umi` 会为我们添加 husky 和 Git commit message 格式校验行为，在每次 Git commit 前会将 Git 暂存区的代码默认格式化。

> 注意：如果是初始化出来的 `@umijs/max` 项目，通常不需要该生成器，因为已经配置好 husky 了

```bash
$umi g precommit
info  - Update package.json for devDependencies
info  - Update package.json for scripts
info  - Write .lintstagedrc
info  - Create .husky
info  - Write commit-msg
info  - Write pre-commit
```
