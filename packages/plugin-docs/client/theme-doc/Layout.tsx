import React from 'react';
import { ThemeContext } from './context';
import Head from './Head';
import Sidebar from './Sidebar';
import Toc from './Toc';

export default (props: any) => {
  return (
    <ThemeContext.Provider
      value={{
        appData: props.appData,
        components: props.components,
        themeConfig: props.themeConfig,
        location: props.location,
      }}
    >
      <div className="flex flex-col">
        <div className="z-20 sticky top-0 before:bg-white before:bg-opacity-[.85] before:backdrop-blur-md before:absolute before:block before:w-full before:h-full before:z-[-1]">
          <Head />
        </div>
        <div className="max-w-[90rem] w-full mx-auto">
          <div className="flex flex-1 h-full">
            <div className="fixed flex-shrink-0 w-full md:w-64 md:sticky z-[15] top-[4rem] self-start overflow-y-auto h-full md:h-auto bg-white dark:bg-dark md:bg-transparent">
              <Sidebar />
            </div>
            <div className="relative flex">
              <div className="flex-1">{props.children}</div>
              <div className="w-64 hidden xl:block text-sm px-4">
                <div className="overflow-y-auto sticky top-16 pt-8 pb-10">
                  <Toc />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
