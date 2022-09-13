import cx from 'classnames';
import slugger from 'github-slugger';
import key from 'keymaster';
import React, { Fragment, useEffect, useState } from 'react';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';

export default () => {
  const { components } = useThemeContext()!;
  const { isFromPath, currentLanguage, render } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const [keyword, setKeyword] = useState('');

  const { appData, themeConfig } = useThemeContext()!;

  const isMac = /(Mac|iPad)/i.test(navigator.userAgent);

  let searchHotKey = '⌘+k, ctrl+k';
  let macSearchKey = '⌘+k';
  let windowsSearchKey = 'ctrl+k';

  if (themeConfig.searchHotKey) {
    if (typeof themeConfig.searchHotKey === 'string') {
      searchHotKey = themeConfig.searchHotKey;
      macSearchKey = themeConfig.searchHotKey;
      windowsSearchKey = themeConfig.searchHotKey;
    }
    if (typeof themeConfig.searchHotKey === 'object') {
      searchHotKey =
        themeConfig.searchHotKey.macos +
        ', ' +
        themeConfig.searchHotKey.windows;
      macSearchKey = themeConfig.searchHotKey.macos;
      windowsSearchKey = themeConfig.searchHotKey.windows;
    }
  }

  useEffect(() => {
    if (!themeConfig.searchHotKey) return;
    key.filter = () => true;

    // 在页面中按下 ⌘+k 可以打开搜索框
    key(searchHotKey, (e) => {
      e.preventDefault();
      document.getElementById('search-input')?.focus();
    });

    // 在搜索框中按下 'Escape' 键可以关闭搜索框
    key('escape', () => {
      (document.activeElement as HTMLElement).blur();
    });

    key('up', handleKeyUp);
    key('down', handleKeyDown);

    return () => {
      key.unbind(searchHotKey);
      key.unbind('escape');
      key.unbind('up');
      key.unbind('down');
    };
  }, []);

  const result = search(appData.routes, keyword);

  return (
    <Fragment>
      <div
        id="search-input-wrapper"
        className="rounded-lg w-40 lg:w-64 flex items-center pr-2 flex-row hover:bg-gray-50
     transition duration-300 bg-gray-100 border border-white focus-within:border-gray-100
     focus-within:bg-white dark:bg-gray-700 dark:border-gray-700 relative
     dark:focus-within:border-gray-700 dark:focus-within:bg-gray-800 dark:text-gray-100"
      >
        <input
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={keyword}
          autoComplete="off"
          onChange={(e) => setKeyword(e.target.value)}
          id="search-input"
          className="w-full bg-transparent outline-none text-sm px-4 py-2"
          placeholder={render('Search anything ...')}
        />
        {themeConfig.searchHotKey && (
          <div
            className="bg-gray-200 rounded px-2 h-6 flex flex-row text-gray-400
         items-center justify-center border border-gray-300 text-xs"
          >
            {isMac ? macSearchKey : windowsSearchKey}
          </div>
        )}
        <div
          id="search-results-wrapper"
          className={cx(
            'absolute transition-all duration-500 top-12 w-96 rounded-lg',
            'cursor-pointer shadow overflow-y-scroll',
            keyword && isFocused ? 'max-h-80' : 'max-h-0',
          )}
        >
          {keyword && result.length === 0 && (
            <div>
              <p
                className="p-2 bg-white hover:bg-gray-50 transition
                 duration-300 group-focus:bg-blue-200 dark:bg-gray-700"
              >
                {render('No result for')} "{keyword}"
              </p>
            </div>
          )}
          {result.map((r, i) => (
            <components.Link
              to={(isFromPath ? currentLanguage?.locale : '') + r.href}
              key={i}
              onClick={() => scrollToAnchor(r.href)}
              className="group outline-none search-result"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              <p
                className="p-2 bg-white hover:bg-gray-50 transition
                 duration-300 group-focus:bg-blue-200 dark:bg-gray-700"
              >
                {r.path}
              </p>
            </components.Link>
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
  const EXCLUDE_PATH = ['README', 'docs-layout'];

  function addResult(newResult: { path: string; href: string }) {
    const { path, href } = newResult;
    if (result.find((r) => r.path === path)) return;
    result.push({ path, href });
  }

  Object.keys(routes).forEach((path) => {
    if (
      path.split('/')[0] === 'components' ||
      EXCLUDE_PATH.includes(path) ||
      /.zh-CN$/.test(path)
    ) {
      return;
    }
    if (path.toLowerCase().includes(keyword.toLowerCase())) {
      addResult({
        path: path.split('/').slice(1).join(' > '),
        href: '/' + path,
      });
    }

    const route = routes[path];
    if (!route.titles) return;
    route.titles.map((title: any) => {
      if (title.title.toLowerCase().includes(keyword.toLowerCase())) {
        addResult({
          path:
            path
              .split('/')
              .map((s) => s.replace(/\.[a-z]{2}-[A-Z]{2}\/?/g, ''))
              .slice(1)
              .join(' > ') +
            ' > ' +
            title.title,
          href: '/' + path + '#' + slugger.slug(title.title),
        });
      }
    });
  });

  if (result.length > 8) return result.slice(0, 8);

  return result;
}

function handleKeyDown(e: KeyboardEvent) {
  if (!document.activeElement) return;

  if (document.activeElement.id === 'search-input') {
    e.preventDefault();
    (
      document.getElementsByClassName('search-result')[0] as
        | HTMLDivElement
        | undefined
    )?.focus();
    return;
  }

  if (document.activeElement.className.indexOf('search-result') === -1) return;

  e.preventDefault();
  (document.activeElement?.nextSibling as HTMLDivElement | undefined)?.focus();
}

function handleKeyUp(e: KeyboardEvent) {
  if (!document.activeElement) return;
  if (document.activeElement.className.indexOf('search-result') === -1) return;
  e.preventDefault();
  (
    document.activeElement?.previousSibling as HTMLDivElement | undefined
  )?.focus();
}

function scrollToAnchor(to: string) {
  const hash = to.match(/(#[^&?]*)/)?.[1] || '';

  (document.activeElement as HTMLElement)?.blur();

  window.requestAnimationFrame(() => {
    const elm = document.getElementById(hash.substring(1));
    if (elm) {
      elm.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  });
}
