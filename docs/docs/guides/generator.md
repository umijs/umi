# Micro Generators

Umi comes with a variety of micro generators that help you quickly accomplish some tedious tasks during development.

## How to Use

The following command will list all available generators. You can use interactive prompts to select the desired functionality, and each generator provides detailed prompts.

```bash
$ umi generate
# Or
$ umi g
```

You can also use the `umi g <generatorName>` format to use a specific generator.

## List of Generators

### Page Generator

Quickly generate a new page in the `src/pages/` directory. Just like the scaffold generator, the page generator has multiple generation methods.

#### Basic Usage

Interactive generation:

```bash
$ umi g page
? What is the name of the page? › mypage
? How do you want page files to be created? › - Use arrow-keys. Return to submit.
❯   mypage/index.{tsx,less}
    mypage.{tsx,less}
```

Direct generation:

```bash
$ umi g page foo
Write: src/pages/foo.tsx
Write: src/pages/foo.less
```

Generate as a directory:

```bash
$ umi g page bar --dir
Write: src/pages/bar/index.less
Write: src/pages/bar/index.tsx
```

Nested generation:

```bash
$ umi g page far/far/away/kingdom
Write: src/pages/far/far/away/kingdom.tsx
Write: src/pages/far/far/away/kingdom.less
```

Batch generation of multiple pages:

```bash
$ umi g page page1 page2 a/nested/page3
Write: src/pages/page1.tsx
Write: src/pages/page1.less
Write: src/pages/page2.tsx
Write: src/pages/page2.less
Write: src/pages/a/nested/page3.tsx
Write: src/pages/a/nested/page3.less
```

#### Customizing Template Content

If the default template used by the page generator doesn't suit your needs, you can customize the template content.

Run the `--eject` command:

```bash
$ umi g page --eject
```

After running the command, the page generator will write its original template to the `/templates/page` directory in your project:

```
.
├── package.json
└── templates
    └── page
        ├── index.less.tpl
        └── index.tsx.tpl
```

##### Using Template Variables

Both template files support template syntax. You can insert variables like this:

```tsx
import React from 'react';
import './{{{name}}}.less'

const message = '{{{msg}}}'
const count = {{{count}}}
```

You can customize parameter values:

```bash
$ umi g page foo --msg "Hello World" --count 10
```

After running the command, the generated page content will be as follows:

```tsx
import React from 'react';
import './foo.less'

const message = 'Hello World'
const count = 10
```

If you don't need template variables, you can omit the `.tpl` extension and use `index.tsx` instead of `index.tsx.tpl`, and `index.less` instead of `index.less.tpl`.

##### Preset Variables

In the generated content from the previous section, we didn't specify the `name`, but it was still set. This is because it's a preset variable in the template. Here are the preset variables available in the page template:

| Variable | Default Value | Description |
|:-:|:-:|:-|
| `name` | - | The name of the current file. If you execute `pnpm umi g page foo`, it will generate `pages/foo.tsx` and `pages/foo.less` files, where the `name` value is "foo". |
| `color` | - | A randomly generated RGB color. |
| `cssExt` | `less` | The file extension for the style files. |

To learn more about template syntax, please refer to [mustache](https://www.npmjs.com/package/mustache).

##### `dir` Mode

Without using the `dir` mode, if your page template folder only customizes one template file, the missing files will automatically use the default template.

If you use the `dir` mode, the generated content will be consistent with your custom template folder for the page. The default template will only be used if the page's custom template folder is empty. If your page's custom template folder content looks like this:

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

##### Rollback

If you want to continue using the default template, you can specify `--fallback`, and user-customized templates won't be used:

```bash
$ umi g page foo --fallback
```

### Component Generator

Generates components that your project needs in the `src/components/` directory. Like the page generator, the component generator also has multiple generation methods.

#### Basic Usage

Interactive generation:

```bash
$ umi g component
✔ Please input your component Name … foo
Write: src/components/Foo/index.ts
Write: src/components/Foo/Foo.tsx
```

Direct generation:

```bash
$ umi g component bar
Write: src/components/Bar/index.ts
Write: src/components/Bar/Bar.tsx
```

Nested generation:

```bash
$ umi g component group/subgroup/baz
Write: src/components/group/subgroup/Baz/index.ts
Write: src/components/group/subgroup/Baz/Baz.tsx
```

Batch generation:

```bash
$ umi g component apple banana orange
Write: src/components/Apple/index.ts
Write: src/components/Apple/Apple.tsx
Write: src/components/Banana/index.ts
Write: src/components/Banana/Banana.tsx
Write: src/components/Orange/index.ts
Write: src/components/Orange/Orange.tsx
```

#### Customizing Template Content

Similar to the [Page Generator](#customizing-template-content) section, the component generator also supports customizing template content. First, write the original template to the `/templates/component` directory in your project:

```bash
$ umi g component --eject
```

##### Using Template Variables

```bash
$ umi g component foo --msg "Hello World"
```

You can omit the `.tpl` extension for custom component templates. You can shorten `index.ts.tpl` to `index.ts` and `component.tsx.tpl` to `component.tsx`.

The component generator will generate content consistent with your custom template folder. You can add more custom template files as needed.

##### Preset Variables

| Variable | Default Value | Description |
|:-:|:-:|:-|
| `compName` | - | The name of the current component. If you execute `pnpm umi g component foo`, the `compName` value is `Foo`. |

##### Rollback

```bash
$ umi g component foo --fallback
```

### RouteAPI Generator

Generates template files for the routeAPI feature.

Interactive generation:

```bash
$ umi g api


✔ Please input your api name … starwar/people
Write: api/starwar/people.ts
```

Direct generation:

```bash
$ umi g api films
Write: api/films.ts
```

Nested generation:

```bash
$ umi g api planets/[id]
Write: api/planets/[id].ts
```

Batch generation:

```bash
$ umi g api spaceships vehicles species
Write: api/spaceships.ts
Write: api/vehicles.ts
Write: api/species.ts
```

### Mock Generator

Generates template files for [Mock](./mock) functionality. Mock implementation details can be found in the [documentation](./mock).

Interactive generation:

```bash
$ umi g mock
✔ Please input your mock file name … auth
Write: mock/auth.ts
```

Direct generation:

```bash
$ umi g mock acl
Write: mock/acl.ts
```

Nested generation:

```bash
$ umi g mock users/profile
Write: mock/users/profile.ts
```

### Prettier Configuration Generator

Generates a [Prettier](https://prettier.io/) configuration for the project. After running the command, `umi` will generate the recommended Prettier configuration and install the necessary dependencies.

```bash
$ umi g prettier
info  - Write package.json
info  - Write .prettierrc
info  - Write .prettierignore
```

### Jest Configuration Generator

Generates a [Jest](https://jestjs.io/) configuration for the project. After running the command, `umi` will generate the Jest configuration and install the necessary dependencies. Choose whether to use [@testing-library/react](https://www.npmjs.com/package/@testing-library/react) for UI testing based on your needs.

```bash
$ umi g jest
✔ Will you use @testing-library/react for UI testing?! … yes
info  - Write package.json
info  - Write jest.config.ts
```

### Tailwind CSS Configuration Generator

Enables [Tailwind CSS](https://tailwindcss.com/) configuration for the project. After running the command, `umi` will generate the Tailwind CSS configuration and install the necessary dependencies.

```bash
$ umi g tailwindcss
info  - Write package.json
set config:tailwindcss on /Users/umi/playground/.umirc.ts
set config:plugins on /Users/umi/playground/.umirc.ts
info  - Update .umirc.ts
info  - Write tailwind.config.js
info  - Write tailwind.css
```

### DvaJS Configuration Generator

Enables [Dva](https://dvajs.com/) configuration for the project. After running the command, `umi` will generate Dva configuration and install the necessary dependencies.

```bash
$ umi g dva
set config:dva on /Users/umi/umi-playground/.umirc.ts
set config:plugins on /Users/umi/umi-playground/.umirc.ts
info  - Update config file
info  - Write example model
```

### Precommit Configuration Generator

Generates a [precommit](https://typicode.github.io/husky) configuration for the project. After running the command, `umi` will add Husky and Git commit message format validation behavior. Before each Git commit, the code in the Git staging area will be automatically formatted by default.

> Note: If you initialize your project with `@umijs/max`, you usually don't need this generator because Husky is already configured.

```bash
$ umi g precommit
info  - Update package.json for devDependencies
info  - Update package.json for scripts
info  - Write .lintstagedrc
info  - Create .husky
info  - Write commit-msg
info  - Write pre-commit
```
