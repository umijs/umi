let manifest = params.manifest;
const env = 'production';
let html = htmlTemplate || "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta\n      name=\"viewport\"\n      content=\"width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no\"\n    />\n    <link rel=\"stylesheet\" href=\"/umi.css\" />\n    <script>\n      window.routerBase = \"/\";\n    </script>\n    <script>\n      //! umi version: undefined\n    </script>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n\n    <script src=\"/umi.js\"></script>\n  </body>\n</html>\n";
let rootContainer = '';
