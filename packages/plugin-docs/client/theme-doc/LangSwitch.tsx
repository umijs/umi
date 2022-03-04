import React, { useEffect, useState } from 'react';
import useLanguage from './useLanguage';

export default () => {
  const { currentLanguage, languages, switchLanguage, isFromPath } =
    useLanguage();
  const [isExpanded, setExpanded] = useState(false);

  // 首次加载时，根据 localstorage 记录的上次语言自动切换
  useEffect(() => {
    const locale = window.localStorage.getItem('umi_locale');
    if (locale && !isFromPath) switchLanguage(locale);
  }, []);

  if (!currentLanguage) {
    return null;
  }

  function handleClick() {
    if (!currentLanguage) return;
    if (languages.length === 2) {
      switchLanguage(
        languages[0].locale === currentLanguage.locale
          ? languages[1].locale
          : languages[0].locale,
      );
      return;
    }
    setExpanded((e) => !e);
  }

  return (
    <div>
      <div
        className="w-24 rounded-lg overflow-hidden cursor-pointer border text-center
       border-white hover:border-gray-100 dark:border-gray-800"
        onClick={handleClick}
      >
        <p className="px-2 py-1 dark:text-white">{currentLanguage.text}</p>
      </div>
      <div
        className={
          'absolute transition-all duration-300 bottom-[-12] w-24 rounded-lg' +
          ' cursor-pointer shadow overflow-hidden ' +
          (isExpanded ? ` max-h-${(languages.length - 1) * 12}` : ' max-h-0 ')
        }
      >
        {languages
          .filter((l) => l.locale !== currentLanguage.locale)
          .map((lang) => (
            <p
              onClick={() => switchLanguage(lang.locale)}
              key={lang.locale}
              className="p-2 bg-white dark:bg-gray-700 dark:text-white hover:bg-gray-50 transition duration-300"
            >
              {lang.text}
            </p>
          ))}
      </div>
    </div>
  );
};
