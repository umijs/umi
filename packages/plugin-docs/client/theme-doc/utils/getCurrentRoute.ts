import type { IContext } from '../context';
import type { useLanguageResult } from '../useLanguage';

export default function getCurrentRoute(
  appData: any,
  lang: useLanguageResult,
  location: IContext['location'],
) {
  return appData.routes[
    lang.isFromPath
      ? location.pathname.split('/').slice(2).join('/') +
        '.' +
        lang.currentLanguage?.locale
      : location.pathname.slice(1)
  ];
}
