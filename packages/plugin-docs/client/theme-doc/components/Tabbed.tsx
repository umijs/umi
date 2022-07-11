import React, { FC, PropsWithChildren, ReactNode, useState } from 'react';

type Pane = {
  title: ReactNode;
  content: ReactNode;
};

type TabbedProps = {
  panes?: Pane[];
};

export default function Tabbed(props: PropsWithChildren<TabbedProps>) {
  const { children } = props;

  const [activeTab, setActiveTab] = useState(0);

  let tabs: ReactNode[] = [];
  let content: ReactNode = null;

  if (props.panes && props.panes.length > 0) {
    tabs = props.panes.map((pane) => {
      return pane.title;
    });

    content = props.panes[activeTab].content;
  } else {
    // Guess pane from children, make mdx more idiomatic
    const childrenArray = React.Children.toArray(children) || [];

    tabs = childrenArray.filter((_, index) => index % 2 === 0);
    const contents = childrenArray.filter((_, index) => index % 2 === 1);

    content = contents[activeTab];
  }

  return (
    <div className="tabbed-code">
      <Wrapper>
        <Tabs tabs={tabs} setActiveTab={setActiveTab} activeTab={activeTab} />
      </Wrapper>
      {content || null}
    </div>
  );
}
const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div className={`w-full pt-5 pt-0 `}>{children}</div>;
};

const Tabs: FC<
  PropsWithChildren<{
    tabs: ReactNode[];
    setActiveTab: Function;
    activeTab: number;
  }>
> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <ul className="cursor-pointer m-0 mt-4 px-0 list-none inline-flex flex-wrap rounded-t-lg text-sm font-small text-center text-gray-500 dark:text-gray-400">
      {tabs.map((tab, index) => {
        return (
          <li key={index} className="mr-0 mt-0">
            <button
              onClick={() => setActiveTab(index)}
              className={`tabbed-tab-button
                hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 
                ${
                  activeTab === index
                    ? 'bg-zinc-900 text-white hover:text-neutral-300 dark:text-white'
                    : 'text-neutral-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 '
                }`}
            >
              {tab}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
