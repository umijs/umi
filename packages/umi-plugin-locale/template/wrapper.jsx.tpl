
{{#localeList.length}}
import { _setIntlObject, addLocaleData, IntlProvider, intlShape } from 'umi/locale';

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
      {{#paths}}...require('{{{.}}}').default,{{/paths}}
    },
    locale: '{{name}}',
    {{#antd}}antd: require('antd/lib/locale-provider/{{lang}}_{{country}}'),{{/antd}}
    data: require('react-intl/locale-data/{{lang}}'),
    momentLocale: '{{momentLocale}}',
  },
  {{/localeList}}
};

let appLocale = {
  locale: '{{defaultLocale}}',
  messages: {},
  data: require('react-intl/locale-data/{{defaultLang}}'),
  momentLocale: '{{defaultMomentLocale}}',
};
if (useLocalStorage && localStorage.getItem('umi_locale') && localeInfo[localStorage.getItem('umi_locale')]) {
  appLocale = localeInfo[localStorage.getItem('umi_locale')];
} else if (localeInfo[navigator.language] && baseNavigator){
  appLocale = localeInfo[navigator.language];
} else {
  appLocale = localeInfo['{{defaultLocale}}'] || appLocale;
}
window.g_lang = appLocale.locale;
{{#localeList.length}}
appLocale.data && addLocaleData(appLocale.data);
{{/localeList.length}}

export default function LocaleWrapper(props) {
  let ret = props.children;
  {{#localeList.length}}
  ret = (<IntlProvider locale={appLocale.locale} messages={appLocale.messages}>
    <InjectedWrapper>{ret}</InjectedWrapper>
  </IntlProvider>)
  {{/localeList.length}}
  {{#antd}}
  ret = (<LocaleProvider locale={appLocale.antd ? (appLocale.antd.default || appLocale.antd) : defaultAntd}>
    {ret}
  </LocaleProvider>);
  {{/antd}}
  return ret;
}
