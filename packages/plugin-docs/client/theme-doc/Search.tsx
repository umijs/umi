import cx from 'classnames';
import React, { Fragment, useEffect, useState } from 'react';
import { useThemeContext } from './context';

export default () => {
  const [isFocused, setIsFocused] = useState(false);
  const [keyword, setKeyword] = useState('');

  const { appData } = useThemeContext()!;

  useEffect(() => {
    document.addEventListener('keydown', function (event) {
      // 在页面中按下 '/' 键可以打开搜索框
      if (event.key === '/') {
        event.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // 在搜索框中按下 'Escape' 键可以关闭搜索框
      if (event.key === 'Escape') {
        document.getElementById('search-input')?.blur();
        (document.activeElement as HTMLElement).blur();
      }
    });
  }, []);

  const result = search(appData.routes, keyword);

  return (
    <Fragment>
      <div
        className="rounded-lg w-40 lg:w-64 flex items-center pr-2 flex-row hover:bg-gray-50
     transition duration-300 bg-gray-100 border border-white focus-within:border-gray-100
     focus-within:bg-white dark:bg-gray-700 dark:border-gray-700
     dark:focus-within:border-gray-700 dark:focus-within:bg-gray-800 dark:text-gray-100"
      >
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          id="search-input"
          className="w-full bg-transparent outline-0 text-sm px-4 py-2 "
          placeholder="Search anything ..."
        />
        <div
          className="bg-gray-200 rounded w-6 h-6 flex flex-row text-gray-400
       focus-within:bg-white"
        >
          <div
            className="bg-gray-200 rounded w-6 h-6 flex flex-row text-gray-400
         items-center justify-center border border-gray-300"
          >
            /
          </div>
        </div>
        <div
          className={cx(
            'absolute transition-all duration-500 top-16 w-96 rounded-lg',
            'cursor-pointer shadow overflow-hidden',
            result.length > 0 && isFocused ? 'max-h-80' : 'max-h-0',
          )}
        >
          {result.map((r, i) => (
            <a
              href={r.href}
              key={i}
              className="group outline-none"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              <p
                className="p-2 bg-white hover:bg-gray-50 transition
                 duration-300 group-focus:bg-blue-200 dark:bg-gray-700"
              >
                {r.path}
              </p>
            </a>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

interface SearchResultItem {
  path: string;
  href: string;
}

function search(routes: any, keyword: string): SearchResultItem[] {
  if (!keyword) return [];

  const result: SearchResultItem[] = [];

  Object.keys(routes).map((path) => {
    if (path.toLowerCase().includes(keyword.toLowerCase())) {
      result.push({
        path: path.split('/').slice(1).join(' > '),
        href: '/' + path,
      });
    }

    const route = routes[path];
    if (!route.titles) return;
    route.titles
      .filter((t: any) => t.level <= 2)
      .map((title: any) => {
        if (title.title.toLowerCase().includes(keyword.toLowerCase())) {
          result.push({
            path: path.split('/').slice(1).join(' > ') + ' > ' + title.title,
            href: '/' + path + '#' + title.title,
          });
        }
      });
  });

  if (result.length > 8) return result.slice(0, 8);

  return result;
}
