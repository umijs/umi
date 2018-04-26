export default function(baseFontSize, fontscale) {
  var _baseFontSize = baseFontSize || 100;
  var _fontscale = fontscale || 1;

  var win = window;
  var doc = win.document;
  var ua = navigator.userAgent;
  var matches = ua.match(/Android[\S\s]+AppleWebkit\/(\d{3})/i);
  var UCversion = ua.match(/U3\/((\d+|\.){5,})/i);
  var isUCHd =
    UCversion && parseInt(UCversion[1].split('.').join(''), 10) >= 80;
  var isIos = navigator.appVersion.match(/(iphone|ipad|ipod)/gi);
  var dpr = win.devicePixelRatio || 1;
  if (!isIos && !(matches && matches[1] > 534) && !isUCHd) {
    // 如果非iOS, 非Android4.3以上, 非UC内核, 就不执行高清, dpr设为1;
    dpr = 1;
  }
  var scale = 1 / dpr;

  var metaEl = doc.querySelector('meta[name="viewport"]');
  if (!metaEl) {
    metaEl = doc.createElement('meta');
    metaEl.setAttribute('name', 'viewport');
    doc.head.appendChild(metaEl);
  }
  metaEl.setAttribute(
    'content',
    'width=device-width,user-scalable=no,initial-scale=' +
      scale +
      ',maximum-scale=' +
      scale +
      ',minimum-scale=' +
      scale
  );
  doc.documentElement.style.fontSize =
    _baseFontSize / 2 * dpr * _fontscale + 'px';
  //处理在OPPO R9S 手机QQ扫码访问，页面显示错误的问题，在该情况下，获取的doc.documentElement.clientWidth为360，
  //其他情况下获取的doc.documentElement.clientWidth为1090
  var clientWidth = doc.documentElement.clientWidth;
  if (!clientWidth) return;
  var div = doc.createElement("div");
  div.style.width = "1rem";
  div.style.height = "0";
  doc.body.appendChild(div);
  var ideal = _baseFontSize * clientWidth / 750;
  var rmd = div.clientWidth / ideal;
  if (rmd > 1.2 || rmd < 0.8) {
    doc.documentElement.style.fontSize = _baseFontSize / 2 * dpr * _fontscale / rmd + "px";
  }
  doc.body.removeChild(div);
}
