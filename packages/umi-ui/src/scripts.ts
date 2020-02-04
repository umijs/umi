import macaddress from 'macaddress';

let macId = '';
const getMacId = async () => {
  if (macId) {
    return macId;
  }
  return new Promise(resolve => {
    macaddress.one((err, mac) => {
      macId = err ? '' : mac;
      resolve(macId);
    });
  });
};

const monitorOptions = JSON.stringify({
  autoCapture: false,
});

const bmMonitorBase = `
<!-- bmMonitorBase Start -->
<script>!function(){var e=window;function n(n){if(e.g_monitor&&e.g_monitor.events){var t=e.g_monitor.events;t.length<20&&t.push(n)}}e.g_monitor=e.g_monitor||{listener:{},events:[]};var r=e.g_monitor.listener;function t(t,n){try{e.addEventListener?e.addEventListener(t,n,!0):e.attachEvent?e.attachEvent("on"+t,n):e[t]=n,r[t]=n}catch(n){console.warn("Tracert 监控事件注册失败："+t,n)}}r.error||t("error",n),r.unhandledrejection||t("unhandledrejection",n)}();</script>
<!-- bmMonitorBase End -->
`;

const bmMonitor = `
<!-- bmMonitor Start -->
<script>
(function loader(){if(window.Tracert){return}var Tracert={_isInit:true,_readyToRun:[],call:function(){var args=arguments;var argsList;try{argsList=[].slice.call(args,0)}catch(ex){var argsLen=args.length;argsList=[];for(var i=0;i<argsLen;i++){argsList.push(args[i])}}Tracert.addToRun(function(){Tracert.call.apply(Tracert,argsList)})},addToRun:function(_fn){var fn=_fn;if(typeof fn==="function"){fn._logTimer=(new Date())-0;Tracert._readyToRun.push(fn)}},};var fnlist=["config","logPv","info","err","click","expo","pageName","pageState","time","timeEnd","parse","expoCheck","stringify","report"];for(var i=0;i<fnlist.length;i++){var fn=fnlist[i];(function(fn){Tracert[fn]=function(){var args=arguments;var argsList;try{argsList=[].slice.call(args,0)}catch(ex){var argsLen=args.length;argsList=[];for(var i=0;i<argsLen;i++){argsList.push(args[i])}}argsList.unshift(fn);Tracert.addToRun(function(){Tracert.call.apply(Tracert,argsList)})}})(fn)}window.Tracert=Tracert})();
      !function(){if(!window.BizLog){var n={_readyToRun:[],call:function(){var o,a=arguments;try{o=[].slice.call(a,0)}catch(i){var u=a.length;o=[];for(var c=0;u>c;c++)o.push(a[c])}n.addToRun(function(){n.call.apply(n,o)})},addToRun:function(o){"function"==typeof o&&(o._logTimer=new Date-0,n._readyToRun.push(o))}};window.BizLog=n}}();
      window.BizLog.call('config', { disabled: true });
</script>
<script>
window._to = {
  autoLogPv: false,
  monitorOptions: ${monitorOptions},
  debug: ${process.env.NODE_ENV === 'development'},
  roleId: '{{ roleId }}'
};
</script>
<script src="https://gw.alipayobjects.com/as/g/component/tracert/3.2.0-monitor.8/index.js"></script>
<!-- bmMonitor End -->
`;

const ga = `
<!-- Google Analytics Start -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-145890626-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-145890626-1', {
    'send_page_view': false,
    'user_id': '{{ roleId }}',
  });
  gtag('set', {
    'user_id': '{{ roleId }}',
    'version': '{{ version }}',
    'type': '{{ type }}',
  });
</script>
<!-- Google Analytics End -->
`;

const deer = `
<!-- deer Start -->
<script>
  !function(t,e,a,r,c){t.TracertCmdCache=t.TracertCmdCache||[],t[c]=window[c]||
  {_isRenderInit:!0,call:function(){t.TracertCmdCache.push(arguments)},
  start:function(t){this.call('start',t)}},t[c].l=new Date;
  var n=e.createElement(a),s=e.getElementsByTagName(a)[0];
  n.async=!0,n.src=r,s.parentNode.insertBefore(n,s);
  n.onerror=function(){console.warn(decodeURI('Tracert%20%E8%84%9A%E6%9C%AC%E6%9C%AA%E6%88%90%E5%8A%9F%E5%8A%A0%E8%BD%BD,%20%E8%AF%B7%E6%A3%80%E6%9F%A5%E7%BD%91%E7%BB%9C%E4%BB%A5%E5%8F%8A%20A%20%E4%BD%8D%E6%98%AF%E5%90%A6%E5%9C%A8%E4%B9%9D%E8%89%B2%E9%B9%BF%E5%BB%BA%E7%AB%8B%E6%B4%9E%E5%AF%9F'));
  var fallback=function(){console.warn(decodeURI('Tracert%20%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C%E5%A4%B1%E8%B4%A5%EF%BC%8C%E8%AF%B7%E6%A3%80%E6%9F%A5%20JS%20%E6%98%AF%E5%90%A6%E6%AD%A3%E7%A1%AE%E5%BC%95%E5%85%A5'))};
  for(var fnlist=["call","start","config","logPv","info","err","click","expo","pageName","pageState","time","timeEnd","parse","checkExpo","stringify","report","set","before"],i=0;i<fnlist.length;i++){t[c][fnlist[i]]=fallback}};
  }(window,document,'script','https://ur.alipay.com/tracert_a1613.js','Tracert');
  Tracert.start({
    monitorOptions: ${monitorOptions},
    roleId: '{{ roleId }}'
  });
  Tracert.call('before', 'logPv', function() {
    Tracert.set({
      fullURL: 'http://ui.bigfish.com/' + location.pathname + (location.search.indexOf('mini') > -1 ? '?mini' : ''),
    });
  });
</script>
<!-- deer End -->
`;

const render = (template: string, model: Object): string => {
  return template.replace(/{{ (\w+) }}/g, (str, key) => model[key]);
};

const getScripts = async () => {
  const macAddress = await getMacId();

  const modal = {
    roleId: macAddress,
    version: process.env.BIGFISH_VERSION || process.env.UMI_VERSION || '',
    type: process.env.BIGFISH_COMPAT ? 'bigfish' : 'umi',
  };
  const deerScript = render(deer, modal);
  const bmMonitorScript = render(bmMonitor, modal);
  const gaScript = render(ga, modal);

  return {
    bigfishScripts: {
      head: [bmMonitorBase, deerScript],
      foot: [],
    },
    umiScripts: {
      head: [bmMonitorBase, bmMonitorScript],
      foot: [gaScript],
    },
  };
};

export default getScripts;
