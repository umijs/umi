import assert from 'assert';

export default function(html) {
  assert(html.indexOf('</head>') > -1, 'html must include <head> tag');

  return html.replace(
    '</head>',
    `
<meta name="fengdie:pkg" content="{{pkgName}}@{{pkgVersion}}" />
<meta name="fengdie:aid" content="{{appid}}" />
<meta name="fengdie:pid" content="{{packageId}}" />
</head>`,
  );
}
