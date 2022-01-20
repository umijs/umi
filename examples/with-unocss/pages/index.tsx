import React from 'react';

export default function HomePage() {
  return (
    <div className="w-full flex flex-row justify-center pb-16">
      <div className="container">
        <div className="w-full">
          <div className="flex flex-row items-center justify-center py-6 pt-48">
            <img
              src={require('../images/umi.png')}
              className="w-12 h-12"
              alt=""
            />
            <p className="text-xl mx-4">x</p>
            <img
              src={require('../images/unocss.svg')}
              className="w-12 h-12"
              alt=""
            />
          </div>
          <h1 className="text-center"></h1>
        </div>
        <h1
          className="text-gray-700 font-extrabold text-4xl sm:text-5xl lg:text-6xl
        tracking-tight text-center dark:text-white"
        >
          UmiJS
          <span className="mx-4">x</span>
          UnoCss
        </h1>
        <p
          className="mt-6 text-lg text-slate-600 text-center
         max-w-3xl mx-auto dark:text-slate-400"
        >
          This is an example using
          <a
            className="mx-2 text-cyan-500"
            href="https://umijs.org/zh-CN"
            target="_blank"
            rel="noreferrer"
          >
            UmiJS
          </a>
          with
          <a
            className="mx-2 text-cyan-500"
            href="https://github.com/antfu/unocss"
            target="_blank"
            rel="noreferrer"
          >
            UnoCss
          </a>
          .
        </p>
        <div className="w-full bg-gray-50 p-16 mt-16 rounded-2xl">
          <p className="text-slate-900 font-extrabold text-4xl mb-4">
            Examples
          </p>

          <div className="flex flex-row my-16">
            <p className="text-slate-900 font-bold text-2xl w-1/3">Text Size</p>
            <div>
              <p className="text-xs">text-xs</p>
              <p className="text-sm">text-sm</p>
              <p className="text-base">text-base</p>
              <p className="text-lg">text-lg</p>
              <p className="text-xl">text-xl</p>
              <p className="text-2xl">text-2xl</p>
              <p className="text-3xl">text-3xl</p>
            </div>
          </div>

          <div className="flex flex-row my-16">
            <p className="text-slate-900 font-bold text-2xl w-1/3">
              Text Color
            </p>

            <div>
              <p className="text-red-300">text-red-300</p>
              <p className="text-blue-600">text-blue-600</p>
              <p className="text-green-300">text-green-300</p>
              <p className="text-pink-400">text-pink-400</p>
            </div>
          </div>

          <div className="flex flex-row my-16">
            <p className="text-slate-900 font-bold text-2xl w-1/3">Sizes</p>
            <div>
              <div className="bg-white w-24 p-4 shadow-2xl rounded-2xl my-4">
                w-24
              </div>
              <div className="bg-white w-36 p-4 shadow-2xl rounded-2xl my-4">
                w-36
              </div>
              <div className="bg-white w-64 p-4 shadow-2xl rounded-2xl my-4">
                w-64
              </div>
              <div className="bg-white w-96 p-4 shadow-2xl rounded-2xl my-4">
                w-96
              </div>
            </div>
          </div>

          <div className="flex flex-row my-16">
            <p className="text-slate-900 font-bold text-2xl w-1/3">
              Animations
            </p>

            <section className="p-10 flex md:flex-row items-center justify-start flex-wrap sm:flex-col">
              <div className="animate-spin h-32 w-32 relative m-10">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="animate-pulse h-32 w-32 relative m-10">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="animate-ping h-32 w-32 relative m-10">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="animate-bounce h-32 w-32 relative m-10">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-row my-16">
            <p className="text-slate-900 font-bold text-2xl w-1/3">
              Hover Animations
            </p>

            <section className="p-10 flex md:flex-row items-center justify-start flex-wrap sm:flex-col">
              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform  hover:scale-75 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform hover:rotate-90 hover:scale-75 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform  hover:rotate-45 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform  hover:-rotate-45 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform origin-left hover:-rotate-45 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform hover:-translate-x-10 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />

                <div className="absolute inset-0 transform hover:rotate-90 hover:translate-x-full hover:scale-150 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>

              <div className="h-32 w-32 relative cursor-pointer m-5">
                <div className="absolute inset-0 bg-white opacity-25 rounded-lg shadow-2xl" />
                <div className="absolute inset-0 transform hover:skew-y-12 transition duration-300">
                  <div className="h-full w-full bg-white rounded-lg shadow-2xl" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
