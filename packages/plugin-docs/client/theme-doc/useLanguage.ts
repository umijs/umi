// @ts-ignore
import { history } from 'umi';
import { useThemeContext } from './context';

interface useLanguageResult {
  isFromPath: boolean;
  currentLanguage: { locale: string; text: string } | undefined;
  languages: { locale: string; text: string }[];
  switchLanguage: (locale: string) => void;
  render: (key: string) => string;
}

function useLanguage(): useLanguageResult {
  const { themeConfig, location } = useThemeContext()!;

  const languages = themeConfig.i18n;
  let currentLanguage: { locale: string; text: string } | undefined = undefined;
  let isFromPath: boolean;

  const s = location.pathname.split('/')[1];

  // 用户当前访问的页面是否有在路径中指定语言
  isFromPath = !!(s && s.match(/^[a-z]{2}-[A-Z]{2}$/));

  if (isFromPath)
    currentLanguage = languages?.find(
      (item) => item.locale === location.pathname.split('/')[1],
    );
  else currentLanguage = languages && languages[0] ? languages[0] : undefined;

  function switchLanguage(locale: string) {
    if (!languages || languages.length === 0) return;

    if (!languages.find((l) => l.locale === locale)) return;

    // 切换到默认语言
    if (locale === languages[0].locale && isFromPath) {
      window.localStorage.removeItem('umi_locale');
      let p = location.pathname.split('/');
      p.shift();
      p.shift();
      history.push('/' + p.join('/'));
      return;
    }

    window.localStorage.setItem('umi_locale', locale);

    // 当前在默认语言，切换到其他语言
    if (!isFromPath) {
      history.push('/' + locale + location.pathname);
      return;
    }

    let p = location.pathname.split('/');
    p[1] = locale;
    history.push('/' + p.join('/'));
  }

  function render(key: string) {
    if (!currentLanguage || !themeConfig.locales) return key;
    if (!themeConfig.locales[currentLanguage.locale]) return key;
    return themeConfig.locales[currentLanguage.locale][key] || key;
  }

  return {
    isFromPath,
    currentLanguage,
    languages: languages || [],
    switchLanguage,
    render,
  };
}

export default useLanguage;
