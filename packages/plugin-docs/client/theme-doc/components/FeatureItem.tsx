import React from "react";

interface Feature {
  icon: string;
  title: string;
  description: string;
  link?: string
}

/**
 * Feature Item 组件是文档首页第二个 Feature 区块中的一个 Item，
 * 从 docs/README.md 中使用 MDX 语法调用，必须被包含在 <Features /> 组件内
 * */
function FeatureItem(props: Feature) {
  return <div
    className="w-3/4 lg:w-1/2 shrink-0 flex flex-row items-center
    snap-always snap-center justify-center">
    <div
      className="flex flex-col w-5/6 lg:w-3/4 px-4 lg:px-16 items-center
      bg-white dark:bg-gray-800 py-16
      border-gray-300 dark:border-gray-500 border
      rounded-xl shadow-xl h-96 lg:h-auto dark:shadow-gray-700">
      <img src={props.icon} className="w-8 h-8" alt="feature-icon" />
      <p
        className="text-3xl lg:text-5xl font-extrabold
         mt-4 mb-8 text-gray-900 dark:text-gray-200">
        {props.title}
      </p>
      <p
        className="text-center text-gray-800 dark:text-gray-400">
        {props.description}
      </p>
      {props.link && <a
        href={props.link}
        target="_blank"
        rel="noreferrer"
        className="mt-8 link-with-underline">
        深入了解
      </a>}
    </div>
  </div>
}

export default FeatureItem;
