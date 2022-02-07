import React, { PropsWithChildren, useEffect, useRef } from "react"

/**
 * Features 组件是文档首页第二个 Feature 区块的容器，
 * 从 docs/README.md 中使用 MDX 语法调用，可在内部传入 <FeatureItem /> 组件
 * */
function Features(props: PropsWithChildren<{ title?: string, subtitle?: string }>) {

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /** 组件加载完毕后，移动滑动条到某个 Feature Item 上，否则初始状态是歪的*/
    if (ref) ref.current?.scrollTo(600, 0)
  }, [ref])

  return <div
    className="w-screen py-36 features dark:features-dark min-h-screen">
    {(props.title || props.subtitle) && <div className="mb-24 px-4">
      {props.title && <p
        className="text-4xl lg:text-5xl font-extrabold mb-4 text-center
          text-gray-700 dark:text-gray-300">
        {props.title}
      </p>}
      {props.subtitle && <p
        className="text-lg lg:text-xl text-center
          text-gray-500 dark:text-gray-400">
        {props.subtitle}
      </p>}
    </div>}
    <div
      ref={ref}
      className="w-full flex flex-row snap-x overflow-x-scroll
       features pb-12 dark:features-dark">
      <div className="w-1/2 shrink-0" />
      {props.children}
      <div className="w-1/2 shrink-0" />
    </div>
  </div>
}

export default Features
