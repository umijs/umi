---
translateHelp: true
---

# HTML Template


## Modify the default template

If the file `src/pages/document.ejs` exists, it will be used as the default template.

Example:

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

The template can get the variables provided by umi through the context. The context contains:

* `route` Routing information, valid when multiple static HTMLs need to be packaged (that is, when `exportStatic` is configured)
* `config` User configuration information

Example:

```html
<link rel="icon" type="image/x-icon" href="<%= context.config.publicPath %>favicon.png" />
```
