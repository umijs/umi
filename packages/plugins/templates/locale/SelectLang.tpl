import React,{ useState } from 'react';
{{#Antd}}
import { Menu, version, Dropdown } from 'antd';
import { ClickParam } from 'antd/{{{antdFiles}}}/menu';
import { DropDownProps } from 'antd/{{{antdFiles}}}/dropdown';
{{/Antd}}
import { getLocale, getAllLocales, setLocale } from './localeExports';

{{#Antd}}
export interface HeaderDropdownProps extends DropDownProps {
  overlayClassName?: string;
  placement?:
    | 'bottomLeft'
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomCenter';
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  overlayClassName: cls,
  ...restProps
}) => {
  const isModern = parseInt(version.split('.')[0], 10) >= 5;
  const overlayClassNameProps = isModern
    ? { classNames: { root: cls } }
    : { overlayClassName: cls };
  return (
    <Dropdown
      {...overlayClassNameProps}
      {...restProps}
    />
  );
};
{{/Antd}}

interface LocalData {
    lang: string,
    label?: string,
    icon?: string,
    title?: string,
}

interface SelectLangProps {
  globalIconClassName?: string;
  postLocalesData?: (locales: LocalData[]) => LocalData[];
  onItemClick?: (params: ClickParam) => void;
  className?: string;
  reload?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const transformArrayToObject = (allLangUIConfig:LocalData[])=>{
  return allLangUIConfig.reduce((obj, item) => {
    if(!item.lang){
      return obj;
    }

    return {
      ...obj,
      [item.lang]: item,
    };
  }, {});
}

const defaultLangUConfigMap = {
  'ar-EG': {
    lang: 'ar-EG',
    label: 'العربية',
    icon: '🇪🇬',
    title: 'لغة'
  },
  'az-AZ': {
    lang: 'az-AZ',
    label: 'Azərbaycan dili',
    icon: '🇦🇿',
    title: 'Dil'
  },
  'bg-BG': {
    lang: 'bg-BG',
    label: 'Български език',
    icon: '🇧🇬',
    title: 'език'
  },
  'bn-BD': {
    lang: 'bn-BD',
    label: 'বাংলা',
    icon: '🇧🇩',
    title: 'ভাষা'
  },
  'ca-ES': {
    lang: 'ca-ES',
    label: 'Catalá',
    icon: '🇨🇦',
    title: 'llengua'
  },
  'cs-CZ': {
    lang: 'cs-CZ',
    label: 'Čeština',
    icon: '🇨🇿',
    title: 'Jazyk'
  },
  'da-DK': {
    lang: 'da-DK',
    label: 'Dansk',
    icon: '🇩🇰',
    title: 'Sprog'
  },
  'de-DE': {
    lang: 'de-DE',
    label: 'Deutsch',
    icon: '🇩🇪',
    title: 'Sprache'
  },
  'el-GR': {
    lang: 'el-GR',
    label: 'Ελληνικά',
    icon: '🇬🇷',
    title: 'Γλώσσα'
  },
  'en-GB': {
    lang: 'en-GB',
    label: 'English',
    icon: '🇬🇧',
    title: 'Language'
  },
  'en-US': {
    lang: 'en-US',
    label: 'English',
    icon: '🇺🇸',
    title: 'Language'
  },
  'es-ES': {
    lang: 'es-ES',
    label: 'Español',
    icon: '🇪🇸',
    title: 'Idioma'
  },
  'et-EE': {
    lang: 'et-EE',
    label: 'Eesti',
    icon: '🇪🇪',
    title: 'Keel'
  },
  'fa-IR': {
    lang: 'fa-IR',
    label: 'فارسی',
    icon: '🇮🇷',
    title: 'زبان'
  },
  'fi-FI': {
    lang: 'fi-FI',
    label: 'Suomi',
    icon: '🇫🇮',
    title: 'Kieli'
  },
  'fr-BE': {
    lang: 'fr-BE',
    label: 'Français',
    icon: '🇧🇪',
    title: 'Langue'
  },
  'fr-FR': {
    lang: 'fr-FR',
    label: 'Français',
    icon: '🇫🇷',
    title: 'Langue'
  },
  'ga-IE': {
    lang: 'ga-IE',
    label: 'Gaeilge',
    icon: '🇮🇪',
    title: 'Teanga'
  },
  'he-IL': {
    lang: 'he-IL',
    label: 'עברית',
    icon: '🇮🇱',
    title: 'שפה'
  },
  'hi-IN': {
    lang: 'hi-IN',
    label: 'हिन्दी, हिंदी',
    icon: '🇮🇳',
    title: 'भाषा: हिन्दी'
  },
  'hr-HR': {
    lang: 'hr-HR',
    label: 'Hrvatski jezik',
    icon: '🇭🇷',
    title: 'Jezik'
  },
  'hu-HU': {
    lang: 'hu-HU',
    label: 'Magyar',
    icon: '🇭🇺',
    title: 'Nyelv'
  },
  'hy-AM': {
    lang: 'hu-HU',
    label: 'Հայերեն',
    icon: '🇦🇲',
    title: 'Լեզու'
  },
  'id-ID': {
    lang: 'id-ID',
    label: 'Bahasa Indonesia',
    icon: '🇮🇩',
    title: 'Bahasa'
  },
  'it-IT': {
    lang: 'it-IT',
    label: 'Italiano',
    icon: '🇮🇹',
    title: 'Linguaggio'
  },
  'is-IS': {
    lang: 'is-IS',
    label: 'Íslenska',
    icon: '🇮🇸',
    title: 'Tungumál'
  },
  'ja-JP': {
    lang: 'ja-JP',
    label: '日本語',
    icon: '🇯🇵',
    title: '言語'
  },
  'ku-IQ': {
    lang: 'ku-IQ',
    label: 'کوردی',
    icon: '🇮🇶',
    title: 'Ziman'
  },
  'kn-IN': {
    lang: 'kn-IN',
    label: 'ಕನ್ನಡ',
    icon: '🇮🇳',
    title: 'ಭಾಷೆ'
  },
  'ko-KR': {
    lang: 'ko-KR',
    label: '한국어',
    icon: '🇰🇷',
    title: '언어'
  },
  'lv-LV': {
    lang: 'lv-LV',
    label: 'Latviešu valoda',
    icon: '🇱🇮',
    title: 'Kalba'
  },
  'mk-MK': {
    lang: 'mk-MK',
    label: 'македонски јазик',
    icon: '🇲🇰',
    title: 'Јазик'
  },
  'mn-MN': {
    lang: 'mn-MN',
    label: 'Монгол хэл',
    icon: '🇲🇳',
    title: 'Хэл'
  },
  'ms-MY': {
    lang: 'ms-MY',
    label: 'بهاس ملايو‎',
    icon: '🇲🇾',
    title: 'Bahasa'
  },
  'nb-NO': {
    lang: 'nb-NO',
    label: 'Norsk',
    icon: '🇳🇴',
    title: 'Språk'
  },
  'ne-NP': {
    lang: 'ne-NP',
    label: 'नेपाली',
    icon: '🇳🇵',
    title: 'भाषा'
  },
  'nl-BE': {
    lang: 'nl-BE',
    label: 'Vlaams',
    icon: '🇧🇪',
    title: 'Taal'
  },
  'nl-NL': {
    lang: 'nl-NL',
    label: 'Nederlands',
    icon: '🇳🇱',
    title: 'Taal'
  },
  'pl-PL': {
    lang: 'pl-PL',
    label: 'Polski',
    icon: '🇵🇱',
    title: 'Język'
  },
  'pt-BR': {
    lang: 'pt-BR',
    label: 'Português',
    icon: '🇧🇷',
    title: 'Idiomas'
  },
  'pt-PT': {
    lang: 'pt-PT',
    label: 'Português',
    icon: '🇵🇹',
    title: 'Idiomas'
  },
  'ro-RO': {
    lang: 'ro-RO',
    label: 'Română',
    icon: '🇷🇴',
    title: 'Limba'
  },
  'ru-RU': {
    lang: 'ru-RU',
    label: 'Русский',
    icon: '🇷🇺',
    title: 'язык'
  },
  'sk-SK': {
    lang: 'sk-SK',
    label: 'Slovenčina',
    icon: '🇸🇰',
    title: 'Jazyk'
  },
  'sr-RS': {
    lang: 'sr-RS',
    label: 'српски језик',
    icon: '🇸🇷',
    title: 'Језик'
  },
  'sl-SI': {
    lang: 'sl-SI',
    label: 'Slovenščina',
    icon: '🇸🇱',
    title: 'Jezik'
  },
  'sv-SE': {
    lang: 'sv-SE',
    label: 'Svenska',
    icon: '🇸🇪',
    title: 'Språk'
  },
  'ta-IN': {
    lang: 'ta-IN',
    label: 'தமிழ்',
    icon: '🇮🇳',
    title: 'மொழி'
  },
  'th-TH': {
    lang: 'th-TH',
    label: 'ไทย',
    icon: '🇹🇭',
    title: 'ภาษา'
  },
  'tr-TR': {
    lang: 'tr-TR',
    label: 'Türkçe',
    icon: '🇹🇷',
    title: 'Dil'
  },
  'uk-UA': {
    lang: 'uk-UA',
    label: 'Українська',
    icon: '🇺🇰',
    title: 'Мова'
  },
  'vi-VN': {
    lang: 'vi-VN',
    label: 'Tiếng Việt',
    icon: '🇻🇳',
    title: 'Ngôn ngữ'
  },
  'zh-CN': {
    lang: 'zh-CN',
    label: '简体中文',
    icon: '🇨🇳',
    title: '语言'
  },
  'zh-TW': {
    lang: 'zh-TW',
    label: '繁體中文',
    icon: '🇭🇰',
    title: '語言'
  }
};

export const SelectLang: React.FC<SelectLangProps> = (props) => {
  {{#ShowSelectLang}}
  const {
  globalIconClassName,
  postLocalesData,
  onItemClick,
  icon,
  style,
  reload,
  ...restProps
} = props;
  const [selectedLang, setSelectedLang] = useState(() => getLocale());

  const changeLang = ({ key }: ClickParam): void => {
    setLocale(key, reload);
    setSelectedLang(getLocale())
  };


  const defaultLangUConfig = getAllLocales().map(
    (key) =>
      defaultLangUConfigMap[key] || {
        lang: key,
        label: key,
        icon: "🌐",
        title: key,
      }
  );

  const allLangUIConfig =
    postLocalesData?.(defaultLangUConfig) || defaultLangUConfig;
  const handleClick = onItemClick
    ? (params: ClickParam) => onItemClick(params)
    : changeLang;

  const menuItemStyle = { minWidth: "160px" };
  const menuItemIconStyle = { marginRight: "8px" };

  const langMenu = {
    selectedKeys: [selectedLang],
    onClick: handleClick,
    items: allLangUIConfig.map((localeObj) => ({
      key: localeObj.lang || localeObj.key,
      style: menuItemStyle,
      label: (
        <>
          <span role="img" aria-label={localeObj?.label || 'en-US'} style={menuItemIconStyle}>
            {localeObj?.icon || '🌐'}
          </span>
          {localeObj?.label || 'en-US'}
        </>
      ),
    })),
  };

  // antd 4.24 之后推荐使用 menu，性能更好
  let dropdownProps;
  if (version.startsWith("6.") || version.startsWith("5.") || version.startsWith("4.24.")) {
    dropdownProps = { menu: langMenu };
  } else if (version.startsWith("3.")) {
    dropdownProps = {
      overlay: (
        <Menu>
          {langMenu.items.map((item) => (
            <Menu.Item key={item.key} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      ),
    };
  } else { // 需要 antd 4.20.0 以上版本
    dropdownProps = { overlay: <Menu {...langMenu} /> };
  }
  
  const inlineStyle = {
    cursor: "pointer",
    padding: "12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    verticalAlign: "middle",
    ...style,
  };

  return (
    <HeaderDropdown {...dropdownProps} placement="bottomRight" {...restProps}>
      <span className={globalIconClassName} style={inlineStyle}>
        <i className="anticon" title={allLangUIConfig[selectedLang]?.title}>
          { icon ?
            icon : (
            <svg
            viewBox="0 0 24 24"
            focusable="false"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
              d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
              className="css-c4d79v"
            />
          </svg>
          )}
        </i>
      </span>
    </HeaderDropdown>
  );
  {{/ShowSelectLang}}
  return <></>
};
