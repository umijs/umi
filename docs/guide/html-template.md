# HTML Template

::: warning
This article has not been translated yet. Wan't to help us out? Click the `Edit this page on GitHub` at the end of the page.
:::

## Modify the Default Template

Create a new `src/pages/document.ejs`, umi stipulates that if this file exists, it will be used as the default template. The content can refer to [umi built-in template](https://github.com/umijs/umi/blob/master/packages /umi-build-dev/template/document.ejs), you need to ensure that `<div id="root"></div>` appears.

## Specifying a Template for a Specific Page

::: warning
This feature requires the `exportStatic` configuration to be enabled.
:::

::: tip
The priority is: pages > pages/document.ejs > umi built-in templates.
:::

TODO
