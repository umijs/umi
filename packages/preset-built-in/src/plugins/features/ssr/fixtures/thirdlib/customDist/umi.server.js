let manifest = params.manifest;
const env = 'production';
let thirdlib = {
    key: 'getIframeHTML',
    value: function getIframeHTML(domain) {
      var domainScript = '';
      var domainInput = '';
      if (domain) {
        var script = 'script';
        domainScript = '<' + script + '>document.domain="' + domain + '";</' + script + '>';
        domainInput = '<input name="_documentDomain" value="' + domain + '" />';
      }
      return '\n    <!DOCTYPE html>\n    <html>\n    <head>\n    <meta http-equiv="X-UA-Compatible" content="IE=edge" />\n    <style>\n    body,html {padding:0;margin:0;border:0;overflow:hidden;}\n    </style>\n    ' + domainScript + '\n    </head>\n    <body>\n  thirdlib </body>\n    </html>\n    ';
    }
}
let html = htmlTemplate || "<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta\n      name=\"viewport\"\n      content=\"width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no\"\n    />\n    <link rel=\"stylesheet\" href=\"/umi.css\" />\n    <script>\n      window.routerBase = \"/\";\n    </script>\n    <script>\n      //! umi version: undefined\n    </script>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n\n    <script src=\"/umi.js\"></script>\n  </body>\n</html>\n";
let rootContainer = '';
