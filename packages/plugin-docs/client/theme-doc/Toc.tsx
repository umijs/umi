import GithubSlugger from 'github-slugger';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useThemeContext } from './context';
import useLanguage from './useLanguage';
import getTocTitle from './utils/getTocTitle';

export default () => {
  const slugger = new GithubSlugger();
  const { location, appData, themeConfig } = useThemeContext()!;
  const lang = useLanguage();
  const route =
    appData.routes[
      lang.isFromPath
        ? location.pathname.split('/').slice(2).join('/') +
          '.' +
          lang.currentLanguage?.locale
        : location.pathname.slice(1)
    ];

  if (!route) {
    return null;
  }

  const titles = route.titles.filter((t: any) => t.level > 1);
  return (
    <div
      className="w-full lg:m-12 mb-12 border
      border-gray-200 dark:border-neutral-700 py-4 rounded-lg z-20"
    >
      {/* @ts-ignore */}
      <Helmet>
        <title>
          {route.titles[0].title} | {themeConfig.title}
        </title>
      </Helmet>
      <p className="text-lg font-extrabold text-gray-800 dark:text-neutral-50 pb-2 border-b border-gray-200 dark:border-neutral-700">
        <span className="px-4">{route.titles[0].title}</span>
      </p>
      <ul className="max-h-[calc(100vh-360px)] overflow-y-auto px-4">
        {titles.map((item: any) => {
          return (
            <li
              style={{ paddingLeft: `${item.level - 2}rem` }}
              className="mt-3 text-gray-600 cursor-pointer dark:text-neutral-400
              hover:text-blue-500 transition duration-300 dark:hover:text-blue-500"
            >
              <a
                className={`${
                  item.level > 2 ? 'text-sm' : 'text-base'
                } break-all 2xl:break-words`}
                href={'#' + slugger.slug(item.title)}
              >
                {getTocTitle(item.title)}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
