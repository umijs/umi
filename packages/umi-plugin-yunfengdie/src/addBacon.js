import assert from 'assert';

const TRACERT_LOADER_VERSION = '1.0.0';
const TRACERT_VERSION = '1.0.2';
const AUTO_SEED_VERSION = '0.2.2';

export default function(html, filePath) {
  assert(typeof html === 'string', `html must be string, but got ${html}`);
  assert(
    typeof filePath === 'string',
    `filePath must be string, but got ${filePath}`,
  );

  assert(html.indexOf('</head>') > -1, 'html must include <head> tag');
  assert(
    html.indexOf('</body>') > -1 && html.indexOf('<body') > -1,
    'html must include <body> tag',
  );

  return html
    .replace(
      '</head>',
      `
{% if enableSpm %}
<meta name="data-bizType" content="{{ bizType }}" />
<meta name="data-aspm" content="{{ spmA }}" />
<script src=https://gw.alipayobjects.com/as/g/datavprod/tracert-loader/${
        TRACERT_LOADER_VERSION
      }/index.js></script>
{% endif %}
</head>`,
    )
    .replace(
      '<body',
      `<body {% if enableSpm %} data-aspm="{{ spmB['${
        filePath
      }'] }}" {% endif %}`,
    )
    .replace(
      '</body>',
      `
{% if enableSpm %}
<script src=https://gw.alipayobjects.com/as/g/datavprod/auto-seed/${
        AUTO_SEED_VERSION
      }/index.js></script>
<script src=https://a.alipayobjects.com/g/component/tracert/${
        TRACERT_VERSION
      }/index.js></script>
<script>
  (function() {
    const spmB = {{ $utils.JSON.stringify(spmB) | safe }};
    window.g_history.listen((location) => {
      let filePath = location.pathname.slice(1);
      if (filePath === '') {
        filePath = 'index.html';
      }
      if (typeof Tracert !== 'undefined' && spmB[filePath]) {
        Tracert.call('config', {
          spmAPos: '{{ spmA }}',
          spmBPos: spmB[filePath]
        });
        Tracert.call('logPv');
      }
    });
  })();
</script>
{% endif %}
</body>`,
    );
}
