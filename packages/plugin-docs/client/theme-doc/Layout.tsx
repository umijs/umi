import cx from 'classnames';
import React, { Fragment, useState } from 'react';
import { ThemeContext } from './context';
import Head from './Head';
import Sidebar from './Sidebar';
import Toc from './Toc';

export default (props: any) => {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        appData: props.appData,
        components: props.components,
        themeConfig: props.themeConfig,
        location: props.location,
      }}
    >
      <div className="flex flex-col dark:bg-gray-900 min-h-screen transition-all">
        <div
          className="z-30 sticky top-0 dark:before:bg-gray-800 before:bg-white before:bg-opacity-[.85]
           before:backdrop-blur-md before:absolute before:block dark:before:bg-opacity-[.85]
           before:w-full before:h-full before:z-[-1]"
        >
          <Head setMenuOpened={setIsMenuOpened} isMenuOpened={isMenuOpened} />
        </div>

        {window.location.pathname === '/' ? (
          <div>{props.children}</div>
        ) : (
          <Fragment>
            <div className="w-full flex flex-row justify-center overflow-x-hidden">
              <div className="container flex flex-row justify-center">
                <div className="w-full lg:w-1/2 px-4 lg:px-0 m-8 z-20 lg:py-12">
                  <article className="flex-1">{props.children}</article>
                </div>
              </div>
            </div>

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

            <div
              className="fixed right-0 top-0 w-1/4 flex flex-row
           justify-center h-screen z-10 pt-20 hidden lg:block"
            >
              <div className="container flex flex-row justify-start">
                <div className="w-2/3 top-32">
                  <Toc />
                </div>
              </div>
            </div>
          </Fragment>
        )}
      </div>

      <div
        className={cx(
          'fixed top-12 w-screen bg-white z-20 dark:bg-gray-800',
          'overflow-hidden transition-all duration-500',
          isMenuOpened ? 'max-h-screen' : 'max-h-0',
        )}
      >
        <Sidebar setMenuOpened={setIsMenuOpened} />
      </div>
    </ThemeContext.Provider>
  );
};
