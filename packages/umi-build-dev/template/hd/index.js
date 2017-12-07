import vw from './vw.js';
import flex from './flex.js';

if (document.documentElement.clientWidth >= 750) {
  vw(100, 750);
} else {
  flex();
}

// hd solution for antd-mobile@2
// ref: https://mobile.ant.design/docs/react/upgrade-notes-cn#%E9%AB%98%E6%B8%85%E6%96%B9%E6%A1%88
document.documentElement.setAttribute('data-scale', true);
