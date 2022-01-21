import React, { useState } from 'react';

const languages = [
  {
    name: 'English',
    value: 'en',
  },
  {
    name: '中文',
    value: 'zh',
  },
];

export default () => {
  const currentLang = 'en';
  const [isExpanded, setExpanded] = useState(false);

  return (
    <div>
      <div
        className="w-24 rounded-lg overflow-hidden cursor-pointer border
       border-white hover:border-gray-100"
        onClick={() => setExpanded((e) => !e)}
      >
        <p className="px-2 py-1">
          {languages.find((l) => l.value === currentLang)?.name || 'English'}
        </p>
      </div>
      <div
        className={
          'absolute transition-all duration-300 bottom-[-12] w-24 rounded-lg' +
          ' cursor-pointer shadow overflow-hidden' +
          (isExpanded ? ` max-h-${(languages.length - 1) * 12}` : ' max-h-0 ')
        }
      >
        {languages
          .filter((l) => l.value !== currentLang)
          .map((lang) => (
            <p
              key={lang.value}
              className="p-2 bg-white hover:bg-gray-50 transition duration-300"
            >
              {lang.name}
            </p>
          ))}
      </div>
    </div>
  );
};
