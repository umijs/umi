const express = require('express');
const fs = require('fs');

const app = express();
const languages = ['en', 'zh-Hans'];

app.use(function (req, res, next) {
  // autodetect language
  if (req.path === '/') {
    if (req.subdomains[0] === 'ali') {
      res.redirect('https://lark.alipay.com/umijs/umi');
      return;
    }
    const lang = [req.query.locale, req.subdomains[0], req.acceptsLanguages(...languages), 'en'].find(function (lang) {
      return languages.includes(lang);
    });
    req.url = '/' + lang + req.url;
    res.setHeader('Content-Language', lang);
  }
  next();
});

app.use(express.static(__dirname + '/build/umijs-site', {
  maxAge: 60000
}));

app.listen(5000);
console.log('Listening on port 5000');
