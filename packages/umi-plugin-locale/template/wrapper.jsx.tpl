import React from 'react';
{{#localeList.length}}
import {
  _setIntlObject,
  addLocaleData,
  IntlProvider,
  intlShape,
  LangContext,
  _setLocaleContext
} from 'umi-plugin-locale';

const InjectedWrapper = (() => {
  let sfc = (props, context) => {
    _setIntlObject(context.intl);
    return props.children;
  };
  sfc.contextTypes = {
    intl: intlShape,
  };
  return sfc;
})();
{{/localeList.length}}

{{#localeList}}
{{#antd}}
{{#momentLocale}}
import 'moment/locale/{{momentLocale}}';
{{/momentLocale}}
{{/antd}}
{{/localeList}}

const baseNavigator = {{{baseNavigator}}};
const useLocalStorage = {{{useLocalStorage}}};

{{#antd}}
import { LocaleProvider } from 'antd';
import moment from 'moment';
{{#defaultMomentLocale}}
import 'moment/locale/{{defaultMomentLocale}}';
{{/defaultMomentLocale}}
let defaultAntd = require('antd/lib/locale-provider/{{defaultAntdLocale}}');
defaultAntd = defaultAntd.default || defaultAntd;
{{/antd}}

const localeInfo = {
  {{#localeList}}
  '{{name}}': {
    messages: {
      {{#paths}}...((locale) => locale.__esModule ? locale.default : locale)(require('{{{.}}}')),{{/paths}}
    },
    locale: '{{name}}',
    {{#antd}}antd: require('antd/lib/locale-provider/{{lang}}_{{country}}'),{{/antd}}
    data: require('react-intl/locale-data/{{lang}}'),
    momentLocale: '{{momentLocale}}',
  },
  {{/localeList}}
};

class LocaleWrapper extends React.Component{
  state = {
    locale: '{{defaultLocale}}',
  };
  getAppLocale(){
    let appLocale = {
      locale: '{{defaultLocale}}',
      messages: {},
      data: require('react-intl/locale-data/{{defaultLang}}'),
      momentLocale: '{{defaultMomentLocale}}',
    };

    const runtimeLocale = require('umi/_runtimePlugin').mergeConfig('locale') || {};
    const runtimeLocaleDefault =  typeof runtimeLocale.default === 'function' ? runtimeLocale.default() : runtimeLocale.default;
    if (
      useLocalStorage
      && typeof localStorage !== 'undefined'
      && localStorage.getItem('umi_locale')
      && localeInfo[localStorage.getItem('umi_locale')]
    ) {
      appLocale = localeInfo[localStorage.getItem('umi_locale')];
    } else if (
      typeof navigator !== 'undefined'
      && localeInfo[navigator.language]
      && baseNavigator
    ) {
      appLocale = localeInfo[navigator.language];
    } else if(localeInfo[runtimeLocaleDefault]){
      appLocale = localeInfo[runtimeLocaleDefault];
    } else {
      appLocale = localeInfo['{{defaultLocale}}'] || appLocale;
    }
    window.g_lang = appLocale.locale;
    {{#localeList.length}}
    appLocale.data && addLocaleData(appLocale.data);
    {{/localeList.length}}

    // support dynamic add messages for umi ui
    // { 'zh-CN': { key: value }, 'en-US': { key: value } }
    if (typeof runtimeLocale.messages === 'object') {
      const runtimeMessage = runtimeLocale.messages[appLocale.locale] || {};
      console.log('runtimeMessage', runtimeMessage, appLocale.locale);
      Object.assign(appLocale.messages, runtimeMessage);
    } else if (typeof runtimeLocale.messages === 'function') {
      const messages = runtimeLocale.messages() || {};
      const runtimeMessage = messages[appLocale.locale] || {};
      Object.assign(appLocale.messages, runtimeMessage);
    }

    return appLocale;
  }
  reloadAppLocale = () => {
    const appLocale = this.getAppLocale();
    this.setState({
      locale: appLocale.locale,
    });
  };

  render(){
    const appLocale = this.getAppLocale();
    const LangContextValue = {
      locale: appLocale.locale,
      reloadAppLocale: this.reloadAppLocale,
    };
    let ret = this.props.children;
    {{#localeList.length}}
    ret = (<IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
      <InjectedWrapper>
        <LangContext.Provider value={LangContextValue}>
          <LangContext.Consumer>{(value) => {
            _setLocaleContext(value);
            return this.props.children
            }}</LangContext.Consumer>
        </LangContext.Provider>
      </InjectedWrapper>
    </IntlProvider>)
    {{/localeList.length}}
    {{#antd}}
     return (<LocaleProvider locale={appLocale.antd ? (appLocale.antd.default || appLocale.antd) : defaultAntd}>
      {ret}
    </LocaleProvider>);
    {{/antd}}
    return ret;
  }
}
export default LocaleWrapper;
