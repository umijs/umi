import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

/**
 * Feature Item 组件是文档首页第二个 Feature 区块中的一个 Item，
 * 从 docs/README.md 中使用 MDX 语法调用，必须被包含在 <Features /> 组件内
 * */
function FeatureItem(props: Feature) {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 flex flex-row items-center justify-center mb-8 lg:mb-16">
      <div
        className="flex flex-col w-5/6 lg:w-3/4 items-center
      bg-white dark:bg-gray-800 py-12 px-6 justify-center
      border-gray-300 dark:border-gray-500 border transition-all hover:scale-105
      rounded-xl shadow-lg hover:shadow-2xl h-72 lg:h-96 dark:shadow-gray-700"
      >
        <img src={props.icon} className="w-8 h-8" alt="feature-icon" />
        <p
          className="text-3xl font-extrabold
         mt-4 mb-8 text-gray-900 dark:text-gray-200"
        >
          {props.title}
        </p>
        <p className="text-center text-gray-600 text-sm lg:text-base dark:text-gray-400">
          {props.description}
        </p>
        {props.link && (
          <a
            href={props.link}
            target="_blank"
            rel="noreferrer"
            className="mt-8 link-with-underline"
          >
            深入了解
          </a>
        )}
      </div>
    </div>
  );
}

export default FeatureItem;
