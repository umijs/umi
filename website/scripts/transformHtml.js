const globby = require('globby');
const { readFileSync, writeFileSync } = require('fs');

function transformFile(path) {
  console.log(`[Replace] ${path}`);
  let content = readFileSync(path, 'utf-8');
  content = content.replace(
    '<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css"/>',
    '<style>.hljs{display:block;overflow-x:auto;padding:0.5em;background:#F0F0F0}.hljs,.hljs-subst{color:#444}.hljs-comment{color:#888888}.hljs-keyword,.hljs-attribute,.hljs-selector-tag,.hljs-meta-keyword,.hljs-doctag,.hljs-name{font-weight:bold}.hljs-type,.hljs-string,.hljs-number,.hljs-selector-id,.hljs-selector-class,.hljs-quote,.hljs-template-tag,.hljs-deletion{color:#880000}.hljs-title,.hljs-section{color:#880000;font-weight:bold}.hljs-regexp,.hljs-symbol,.hljs-variable,.hljs-template-variable,.hljs-link,.hljs-selector-attr,.hljs-selector-pseudo{color:#BC6060}.hljs-literal{color:#78A960}.hljs-built_in,.hljs-bullet,.hljs-code,.hljs-addition{color:#397300}.hljs-meta{color:#1f7199}.hljs-meta-string{color:#4d99bf}.hljs-emphasis{font-style:italic}.hljs-strong{font-weight:bold}</style>',
  );
  writeFileSync(path, content, 'utf-8');
}

function init() {
  const files = globby.sync('build/umijs-site/**/*.html');
  files.forEach(transformFile);
}

init();
