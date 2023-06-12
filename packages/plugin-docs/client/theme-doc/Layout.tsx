import cx from 'classnames';
import React, { Fragment, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'umi';
import Announcement from './components/Announcement';
import { ThemeContext } from './context';
import Head from './Head';
import Sidebar from './Sidebar';
import Toc from './Toc';

export default (props: any) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  /**
   FireFox CSS backdrop-filter polyfill
   https://www.cnblogs.com/coco1s/p/14953143.html
   */
  useEffect(() => {
    let blur = document.getElementById('firefox-head-bg')?.style;
    let offset = document.getElementById('head-container');

    function updateBlur() {
      if (!offset || !blur) return;
      blur.backgroundPosition =
        `0px ` + `calc(var(--anchor-offset) + ${-window.scrollY + 64}px)`;
    }

    document.addEventListener('scroll', updateBlur, false), updateBlur();
    return () => {
      document.removeEventListener('scroll', updateBlur, false);
    };
  }, []);

  const { title, description } = props.themeConfig;
  const location = useLocation();
  const isHomePage =
    window.location.pathname === '/' ||
    window.location.pathname.replace(/[a-z]{2}-[A-Z]{2}\/?/, '') === '/' ||
    location?.pathname === '/' ||
    location?.pathname.replace(/[a-z]{2}-[A-Z]{2}\/?/, '') === '/';

  return (
    <ThemeContext.Provider
      value={{
        appData: props.appData,
        components: props.components,
        themeConfig: props.themeConfig,
        location: props.location,
        history: props.history,
      }}
    >
      <div
        className="flex flex-col dark:bg-gray-900 min-h-screen transition-all"
        id={isHomePage ? 'home-page' : 'doc-page'}
      >
        <div
          id="head-container"
          className="z-30 sticky top-0 dark:before:bg-gray-800 before:bg-white before:bg-opacity-[.85]
           before:backdrop-blur-md before:absolute before:block dark:before:bg-opacity-[.85]
           before:w-full before:h-full before:z-[-1]"
        >
          <Announcement />
          <Head setMenuOpened={setIsMenuOpened} isMenuOpened={isMenuOpened} />
        </div>

        <div className="g-glossy-firefox-cover" />
        <div className="g-glossy-firefox" id="firefox-head-bg" />

        {isHomePage ? (
          <div id="article-body">
            {/* @ts-ignore */}
            <Helmet>
              <title>
                {title}
                {description ? ` - ${description}` : ''}
              </title>
            </Helmet>
            {props.children}
          </div>
        ) : (
          <Fragment>
            <div
              id="article-body"
              className="w-full flex flex-row justify-center overflow-x-hidden"
            >
              {/* 左侧菜单 */}
              <div
                className="fixed left-0 top-0 w-1/4 flex flex-row
          justify-center h-screen z-10 pt-20"
              >
                <div className="container flex flex-row justify-end">
                  <div className="hidden lg:block">
                    <Sidebar />
                  </div>
                </div>
              </div>
              {/* 文章内容 */}
              <div className="container flex flex-row justify-center">
                <div className="w-full lg:w-1/2 px-4 lg:px-2 m-8 z-20 lg:pb-12 lg:pt-6">
                  <article className="flex-1">{props.children}</article>
                </div>
              </div>
              {/* 右侧 Toc */}
              <div
                className="fixed right-0 top-0 w-1/4 hidden lg:block flex-row
justify-center h-screen z-10 pt-20"
              >
                <div className="container flex flex-row justify-start">
                  <div className="w-2/3 top-32">
                    <Toc />
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        )}
      </div>

      <div
        className={cx(
          'fixed top-12 w-screen bg-white z-20 dark:bg-gray-800',
          'overflow-hidden transition-all duration-500 lg:hidden',
          isMenuOpened ? 'max-h-screen' : 'max-h-0',
        )}
      >
        <Sidebar setMenuOpened={setIsMenuOpened} />
      </div>
    </ThemeContext.Provider>
  );
};
