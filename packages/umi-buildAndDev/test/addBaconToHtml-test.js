import expect from 'expect';
import addBaconToHtml from '../src/addBaconToHtml';

describe('addBaconToHtml', () => {
  it('normal', () => {
    const result = addBaconToHtml(
      `
<head><meta charset="utf-8" /></head>
<body><div>hello</div></body>
`,
      'a.html',
    );
    expect(result.trim()).toEqual(
      `
<head><meta charset="utf-8" />
{% if enableSpm %}
  <meta name="data-bizType" content="{{ bizType }}" />
  <meta name="data-aspm" content="{{ spmA }}" />
  <script>
    window.g_enableSPM = [
      {{ spmA }},
      {{ spmB['a.html'] }}
    ];
  </script>
  <script src=https://gw.alipayobjects.com/as/g/datavprod/tracert-loader/1.0.0/index.js></script>
{% endif %}
</head>
<body {% if enableSpm %} data-aspm="{{ spmB['a.html'] }}" {% endif %}><div>hello</div>
{% if enableSpm %}
  <script src=https://gw.alipayobjects.com/as/g/datavprod/auto-seed/0.2.2/index.js></script>
  <script src=https://a.alipayobjects.com/g/component/tracert/1.0.2/index.js></script>
{% endif %}
</body>
`.trim(),
    );
  });

  it('error catch: html must include <head> tag', () => {
    expect(() => {
      addBaconToHtml('', 'a.html');
    }).toThrow(/html must include <head> tag/);
  });

  it('error catch: html must include <head> tag', () => {
    expect(() => {
      addBaconToHtml('<head></head>', 'a.html');
    }).toThrow(/html must include <body> tag/);
  });
});
