import vw from 'umi-hd/lib/vw';
import flex from 'umi-hd/lib/flex';

// Fix document undefined when ssr. #2571
if (typeof document !== 'undefined') {
  if (document.documentElement.clientWidth >= 750) {
    vw(100, 750);
  } else {
    flex();
  }

  // hd solution for antd-mobile@2
  // ref: https://mobile.ant.design/docs/react/upgrade-notes-cn#%E9%AB%98%E6%B8%85%E6%96%B9%E6%A1%88
  document.documentElement.setAttribute('data-scale', true);
}
