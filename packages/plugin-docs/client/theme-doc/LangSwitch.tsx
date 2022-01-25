import React, { useState } from 'react';
import useLanguage from './useLanguage';

export default () => {
  const { currentLanguage, languages, switchLanguage } = useLanguage();
  const [isExpanded, setExpanded] = useState(false);

  if (!currentLanguage) {
    return null;
  }

  return (
    <div>
      <div
        className="w-24 rounded-lg overflow-hidden cursor-pointer border
       border-white hover:border-gray-100 dark:border-gray-800"
        onClick={() => setExpanded((e) => !e)}
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
