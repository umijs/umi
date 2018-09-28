
import { addLocaleData, IntlProvider, injectIntl } from 'react-intl';
import { _setIntlObject } from 'umi/locale';

const InjectedWrapper = injectIntl(function(props) {
  _setIntlObject(props.intl);
  return props.children;
})

import 'moment/locale/zh-cn';

const baseNavigator = false;
const useLocalStorage = true;

import { LocaleProvider } from 'antd';
import moment from 'moment';
const defaultAntd = require('antd/lib/locale-provider/en_US');

function requireFiles(files){
    var messages={};
    files=JSON.parse(files);
    for(var i=0;i<files.length;i++){
      var key=files[i].key?files[i].key+'.':'';
      var fileMessages= require('d:/实验室/react/umi/umi-xxg/packages/umi-plugin-locale/examples/base/src/locales'+files[i].path).default;
      for(var msgKey in fileMessages){
        messages[key+msgKey]=fileMessages[msgKey];
      }
    }
    return messages;
}


const localeInfo = {
  'en-US': {
    messages:requireFiles('[{"path":"/en-US/component/account.js","key":"component.account"},{"path":"/en-US/global.js","key":""}]'),
    locale: 'en-US',
    antd: require('antd/lib/locale-provider/en_US'),
    data: require('react-intl/locale-data/en'),
    momentLocale: '',
  },
  'zh-CN': {
    messages:requireFiles('[{"path":"/zh-CN/component/account.js","key":"component.account"},{"path":"/zh-CN/global.js","key":""}]'),
    locale: 'zh-CN',
    antd: require('antd/lib/locale-provider/zh_CN'),
    data: require('react-intl/locale-data/zh'),
    momentLocale: 'zh-cn',
  },
};

let appLocale = {
  locale: 'en-US',
  messages: {},
  data: require('react-intl/locale-data/en'),
  momentLocale: '',
};
if (useLocalStorage && localStorage.getItem('umi_locale') && localeInfo[localStorage.getItem('umi_locale')]) {
  appLocale = localeInfo[localStorage.getItem('umi_locale')];
} else if (localeInfo[navigator.language] && baseNavigator){
  appLocale = localeInfo[navigator.language];
} else {
  appLocale = localeInfo['en-US'] || appLocale;
}
window.g_lang = appLocale.locale;
appLocale.data && addLocaleData(appLocale.data);

export default (props) => {
  let ret = props.children;
  ret = (<IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
    <InjectedWrapper>{ret}</InjectedWrapper>
  </IntlProvider>)
  ret = (<LocaleProvider locale={appLocale.antd || defaultAntd}>
    {ret}
  </LocaleProvider>);
  return ret;
}
