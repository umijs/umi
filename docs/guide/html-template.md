# HTML Template

## Modify the default template

Create a new file `src/pages/document.ejs`, umi stipulates that if this file exists, it will be used as the default template. You need to ensure that `<div id="root"></div>` appears.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Your App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## Configure template

In HTML template, the variables provided by umi can be consumed from `context', which contains:

* `route`, route object, including attributes such as path and component
* `config`, configuration information
* `publicPath`<Badge text="2.1.2+"/>, `output.publicPath` of webpack
* `env`, environment variable with a value of development or production
* Other configurations extended from context in the route

HTML template is rendered based on ejs , you can refer to [https://github.com/mde/ejs](https://github.com/mde/ejs) for specific usage.

For example, escaped output:

```html
<link rel="icon" type="image/x-icon" href="<%= context.publicPath %>favicon.png" />
```

For example, conditional judgment:

```html
<% if(context.env === 'production') { %>
  <h2>Production environment</h2>
<% } else {%>
  <h2>Development environment</h2>
<% } %>
```

## Specify templates for specific pages

::: warning
This function needs to turn on the `exportStatic` configuration, otherwise only one index.html file is output by default.
:::

::: tip
Priority: `document` of route > src/pages/document.ejs > built-in template of umi
:::

Configure the `document` attribute of route.

For example, conventional routing can extend the `document` attribute in annotations, and the path is relative to the root directory of  project:

```js
/**
 * document: ./src/documents/404.ejs
 */
```

Then umi will output HTML for this route with using `./src/documents/404.ejs` as the template.
