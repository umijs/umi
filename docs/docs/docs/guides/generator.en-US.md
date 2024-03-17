---
order: 12
toc: content
translated_at: '2024-03-17T10:31:39.880Z'
---

# Micro Generators

Umi comes with numerous micro generators to assist you in quickly completing some tedious work during development.

## How to Use

The command below will list all currently available generators, which you can select through an interactive way, with detailed prompts provided.

```bash
$ umi generate
# Or
$ umi g
```

You can also use a specific generator by `umi g <generatorName>`.

## Generator List

### Page Generator

Quickly generate a new page, with multiple usage methods available.

#### Basic Usage

Interactive input of page name and file generation method:

```bash
$umi g page
? What is the name of page? › mypage
? How dou you want page files to be created? › - Use arrow-keys. Return to submit.
❯   mypage/index.{tsx,less}
    mypage.{tsx,less}
```

Direct generation:

```bash
$umi g page foo
Write: src/pages/foo.tsx
Write: src/pages/foo.less
```

Generate a page in directory mode, with the directory containing the page's component and style files:

```bash
$umi g page bar --dir
Write: src/pages/bar/index.less
Write: src/pages/bar/index.tsx
```

Nested generation of pages:

```bash
$umi g page far/far/away/kingdom
Write: src/pages/far/far/away/kingdom.tsx
Write: src/pages/far/far/away/kingdom.less
```

Batch generation of multiple pages:

```bash
$umi g page  page1  page2   a/nested/page3
Write: src/pages/page1.tsx
Write: src/pages/page1.less
Write: src/pages/page2.tsx
Write: src/pages/page2.less
Write: src/pages/a/nested/page3.tsx
Write: src/pages/a/nested/page3.less
```

#### Customizing Page Template Content

If the page generator's default template does not meet your needs, you can customize the template content.

Execute `--eject` command:

```bash
$umi g page --eject
```

After the command is executed, the page generator will write its original template into the project's `/templates/page` directory:

```
.
├── package.json
└── templates
    └── page
        ├── index.less.tpl
        └── index.tsx.tpl
```

##### Using Template Variables

Both template files support template syntax, you can insert variables like this:

```tsx
import React from 'react';
import './{{{name}}}.less'

const message = '{{{msg}}}'
const count = {{{count}}}
```

Customize argument values:

```bash
$umi g page foo --msg "Hello World" --count 10
```
After running the command, the generated page content is as follows:

```tsx
import React from 'react';
import './foo.less'

const message = 'Hello World'
const count = 10
```

If you do not need to use template variables, you can omit the `.tpl` suffix, shorten `index.tsx.tpl` to `index.tsx`, and `index.less.tpl` to `index.less`.

##### Preset Variables

In the content generated in the previous section, we did not specify `name`, but it was still set to a value. This is because it belongs to the template's preset variables, below are all the preset variables currently available in the page template:

| Parameter | Default Value | Description |
| :-------: | :-----------: | :---------- |
| `name` | - | The name of the current file. If you execute `pnpm umi g page foo`, it will generate `pages/foo.tsx` and `pages/foo.less` files, where the value of `name` is "foo". |
| `color` | - | Generates a random RGB color. |
| `cssExt` | `less` | The file extension of the style sheet. |

To learn more about the template syntax, please refer to [mustache](https://www.npmjs.com/package/mustache).

##### `dir` Mode

Without using `dir` mode, if your page template folder only customizes one template file, missing files will automatically select the default template file.

If you use `dir` mode, its generated content will be consistent with your page custom template folder, and will only use the default template if your page custom template folder is empty. If your page custom template folder content is as follows:

```
.
├── a.tsx
└── index.tsx.tpl
```

The generated directory will be:

```
.
├── a.tsx
└── index.tsx
```

##### Fallback

If you still want to continue using the default template, you can specify `--fallback`, and the user-defined template will no longer be used:

```bash
$umi g page foo --fallback
```

### Component Generator

Generate needed components in the `src/components/` directory. Like the page generator, the component generator also has multiple generation methods.

#### Basic Usage

Interactive generation:
```bash
$umi g component
✔ Please input you component Name … foo
Write: src/components/Foo/index.ts
Write: src/components/Foo/component.tsx
```

Direct generation:
```bash
$umi g component bar
Write: src/components/Bar/index.ts
Write: src/components/Bar/component.tsx
```

Nested generation:
```bash
$umi g component group/subgroup/baz
Write: src/components/group/subgroup/Baz/index.ts
Write: src/components/group/subgroup/Baz/component.tsx
```

Batch generation:
```bash
$umi g component apple banana orange
Write: src/components/Apple/index.ts
Write: src/components/Apple/component.tsx
Write: src/components/Banana/index.ts
Write: src/components/Banana/component.tsx
Write: src/components/Orange/index.ts
Write: src/components/Orange/component.tsx
```

#### Customizing Component Template Content

Similar to the [Page Generator](#customizing-page-template-content), the component generator also supports customizing the template content. First, write the original template into the project's `/templates/component` directory:

```bash
$umi g component --eject
```

##### Using Template Variables

```bash
$umi g component foo --msg "Hello World"
```

Custom component templates can omit the `.tpl` suffix. You can shorten `index.ts.tpl` to `index.ts`, and `component.tsx.tpl` to `component.tsx`.

The component generator will generate content consistent with your custom template folder, and you can add more custom template files as needed.

##### Preset Variables

| Parameter | Default Value | Description |
| :-------: | :-----------: | :---------- |
| `compName` | - | The name of the current component. If you execute `pnpm umi g component foo`, the value of `compName` is `Foo`. |

##### Fallback

```bash
$umi g component foo --fallback
```

### RouteAPI Generator

Generate template files for the routeAPI feature.

Interactive generation:
```bash
$umi g api
✔ please input your api name: … starwar/people
Write: api/starwar/people.ts
```

Direct generation:
```bash
$umi g api films
Write: api/films.ts
```

Nested generator:
```bash
$umi g api planets/[id]
Write: api/planets/[id].ts
```

Batch generation:
```bash
$umi g api spaceships vehicles species
Write: api/spaceships.ts
Write: api/vehicles.ts
Write: api/species.ts
```

### Mock Generator

Generate template files for the [Mock](./mock) feature, refer to the [documentation](./mock) for the specific implementation of mock.

Interactive generation:
```bash
$umi g mock
✔ please input your mock file name … auth
Write: mock/auth.ts
```

Direct generation:
```bash
$umi g mock acl
Write: mock/acl.ts
```

Nested generation:
```bash
$umi g mock users/profile
Write: mock/users/profile.ts
```

### Prettier Configuration Generator

Generate [prettier](https://prettier.io/) configuration for the project, after executing the command, `umi` will generate recommended prettier configuration and install related dependencies.

```bash
$umi g prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
```

### Jest Configuration Generator

Generate [jest](https://jestjs.io/) configuration for the project, after executing the command, `umi` will generate Jest configuration and install related dependencies. Choose whether to use [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) for UI testing as needed.

```bash
$umi g jest
✔ Will you use @testing-library/react for UI testing?! … yes
info  - Write package.json
info  - Write jest.config.ts
```

### Tailwind CSS Configuration Generator

Enable [Tailwind CSS](https://tailwindcss.com/) configuration for the project, after executing the command, `umi` will generate Tailwind CSS and install related dependencies.

```bash
$umi g tailwindcss
info  - Write package.json
set config:tailwindcss on /Users/umi/playground/.umirc.ts
set config:plugins on /Users/umi/playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

### DvaJS Configuration Generator

Enable [Dva](https://dvajs.com/) configuration for the project, after executing the command, `umi` will generate Dva.

```bash
$umi g dva
set config:dva on /Users/umi/umi-playground/.umirc.ts
set config:plugins on /Users/umi/umi-playground/.umirc.ts
info  - Update config file
info  - Write example model
```

### Precommit Configuration Generator

Generate [precommit](https://typicode.github.io/husky) configuration for the project, after executing the command, `umi` will add husky and Git commit message format validation behavior, default formatting the Git staging area code before each Git commit.

> Note: If it is an initialized `@umijs/max` project, usually this generator is not needed, as husky is already configured.

```bash
$umi g precommit
info  - Update package.json for devDependencies
info  - Update package.json for scripts
info  - Write .lintstagedrc
info  - Create .husky
info  - Write commit-msg
info  - Write pre-commit
```
