import React from 'react';
{{#Antd}}
import { ConfigProvider } from 'antd';
{{/Antd}}

{{#MomentLocales.length}}
import moment from '{{{momentPkgPath}}}';
{{#MomentLocales}}
import '{{{momentPkgPath}}}/locale/{{.}}';
{{/MomentLocales}}
{{/MomentLocales.length}}
import { RawIntlProvider, getLocale, getDirection , setIntl, getIntl, localeInfo, event, LANG_CHANGE_EVENT } from './localeExports';

{{#DefaultAntdLocales}}
import {{NormalizeAntdLocalesName}} from '{{{.}}}';
{{/DefaultAntdLocales}}



export function _onCreate() {
  const locale = getLocale();
  {{#MomentLocales.length}}
  if (moment?.locale) {
    moment.locale(localeInfo[locale]?.momentLocale || '{{{DefaultMomentLocale}}}');
  }
  {{/MomentLocales.length}}
  setIntl(locale);
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect

export const _LocaleContainer = (props:any) => {
    const initLocale = getLocale();
    const [locale, setLocale] = React.useState(initLocale);
  const [intl, setContainerIntl] = React.useState(() => getIntl(locale, true));

  const handleLangChange = (locale:string) => {
    {{#MomentLocales.length}}
    if (moment?.locale) {
      moment.locale(localeInfo[locale]?.momentLocale || 'en');
    }
    {{/MomentLocales.length}}
    setLocale(locale);
    setContainerIntl(getIntl(locale));
  };

  useIsomorphicLayoutEffect(() => {
    event.on(LANG_CHANGE_EVENT, handleLangChange);
    {{#Title}}
    // avoid reset route title
    if (typeof document !== 'undefined' && intl.messages['{{.}}']) {
      document.title = intl.formatMessage({ id: '{{.}}' });
    }
    {{/Title}}
    return () => {
      event.off(LANG_CHANGE_EVENT, handleLangChange);
    };
  }, []);

  {{#Antd}}
  const defaultAntdLocale = {
    {{#DefaultAntdLocales}}
    ...{{NormalizeAntdLocalesName}},
    {{/DefaultAntdLocales}}
  }
  const direction = getDirection();

  return (
    <ConfigProvider  direction={direction} locale={localeInfo[locale]?.antd || defaultAntdLocale}>
      <RawIntlProvider value={intl}>{props.children}</RawIntlProvider>
    </ConfigProvider>
  )
  {{/Antd}}
  {{^Antd}}
  return <RawIntlProvider value={intl}>{props.children}</RawIntlProvider>;
  {{/Antd}}
};
