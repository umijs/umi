import React from 'react';
{{#localeList.length}}
import {
  _setIntlObject,
  addLocaleData,
  IntlProvider,
  intlShape,
  LangContext,
  _setLocaleContext
} from 'umi-plugin-locale/lib/locale';

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
const baseSeparator = '{{{baseSeparator}}}';
const useLocalStorage = {{{useLocalStorage}}};

{{#antd}}
import { LocaleProvider, version } from 'antd';
import moment from 'moment';
{{#defaultMomentLocale}}
import 'moment/locale/{{defaultMomentLocale}}';
{{/defaultMomentLocale}}
let defaultAntd = require('antd/{{requireModule}}/locale-provider/{{defaultAntdLocale}}');
defaultAntd = defaultAntd.default || defaultAntd;
{{/antd}}

const localeInfo = {
  {{#localeList}}
  '{{name}}': {
    messages: {
      {{#paths}}...((locale) => locale.__esModule ? locale.default : locale)(require('{{{.}}}')),{{/paths}}
    },
    locale: '{{name}}',
    {{#antd}}antd: require('antd/{{requireModule}}/locale-provider/{{lang}}_{{country}}'),{{/antd}}
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
    window.g_langSeparator = baseSeparator || '-';
    {{#localeList.length}}
    appLocale.data && addLocaleData(appLocale.data);
    {{/localeList.length}}

    // support dynamic add messages for umi ui
    // { 'zh-CN': { key: value }, 'en-US': { key: value } }
    const runtimeLocaleMessagesType = typeof runtimeLocale.messages;
    if (runtimeLocaleMessagesType === 'object' || runtimeLocaleMessagesType === 'function') {
      const runtimeMessage = runtimeLocaleMessagesType === 'object'
        ? runtimeLocale.messages[appLocale.locale]
        : runtimeLocale.messages()[appLocale.locale];
      Object.assign(appLocale.messages, runtimeMessage || {});
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
    // react-intl must use `-` separator
    const reactIntlLocale = appLocale.locale.split(baseSeparator).join('-');
    const LangContextValue = {
      locale: reactIntlLocale,
      reloadAppLocale: this.reloadAppLocale,
    };
    let ret = this.props.children;
    {{#localeList.length}}
    ret = (<IntlProvider locale={reactIntlLocale} messages={appLocale.messages}>
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
     // avoid antd ConfigProvider not found
     let AntdProvider = LocaleProvider;
     const [major, minor] = `${version || ''}`.split('.');
     // antd 3.21.0 use ConfigProvider not LocaleProvider
     const isConfigProvider = Number(major) > 3 || (Number(major) >= 3 && Number(minor) >= 21);
     if (isConfigProvider) {
       try {
         AntdProvider = require('antd/{{requireModule}}/config-provider').default;
       } catch (e) {}
     }

     return (<AntdProvider locale={appLocale.antd ? (appLocale.antd.default || appLocale.antd) : defaultAntd}>
      {ret}
    </AntdProvider>);
    {{/antd}}
    return ret;
  }
}
export default LocaleWrapper;
