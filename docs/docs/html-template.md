# HTML Template


## Modify the default template

Create a new `src/pages/document.ejs`, umi agrees that if this file exists, it will be used as the default template, such as:

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

## Configuration template

The variables provided by umi can be obtained through the context in the template. The context contains:

* `route`，routing information, valid when multiple static HTML needs to be packaged (that is, when exportStatic is configured)
* `config`，User configuration information

such as:

```html
<link rel="icon" type="image/x-icon" href="<%= context.config.publicPath %>favicon.png" />
```
