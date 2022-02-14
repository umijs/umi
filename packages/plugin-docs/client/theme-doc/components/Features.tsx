import React, { PropsWithChildren } from 'react';

/**
 * Features 组件是文档首页第二个 Feature 区块的容器，
 * 从 docs/README.md 中使用 MDX 语法调用，可在内部传入 <FeatureItem /> 组件
 * */
function Features(
  props: PropsWithChildren<{ title?: string; subtitle?: string }>,
) {
  return (
    <div className="w-screen py-36 features dark:features-dark min-h-screen">
      {(props.title || props.subtitle) && (
        <div className="mb-24 px-4">
          {props.title && (
            <p
              className="text-4xl lg:text-5xl font-extrabold mb-4 text-center
          text-gray-700 dark:text-gray-300"
            >
              {props.title}
            </p>
          )}
          {props.subtitle && (
            <p
              className="text-lg lg:text-xl text-center
          text-gray-500 dark:text-gray-400"
            >
              {props.subtitle}
            </p>
          )}
        </div>
      )}
      <div className="w-full flex flex-row justify-center">
        <div
          className="w-full flex flex-row flex-wrap
       features pb-12 dark:features-dark container"
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default Features;
