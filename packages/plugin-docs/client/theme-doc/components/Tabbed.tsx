import React, { FC, PropsWithChildren, ReactNode, useState } from 'react';

type Tab =
  | {
      icon: ReactNode;
      title: ReactNode;
    }
  | ReactNode;

type TabbedProps = {
  tabs: Tab[];
};

export default function Tabbed(props: PropsWithChildren<TabbedProps>) {
  const { children, tabs } = props;

  const [activeTab, setActiveTab] = useState(0);

  const content = children.filter((_, i) => {
    return i === activeTab;
  })[0];

  return (
    <div className="tabbed-code">
      <Wrapper>
        <Tabs tabs={tabs} setActiveTab={setActiveTab} activeTab={activeTab} />
      </Wrapper>
      {content}
    </div>
  );
}
const Wrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div className={`w-full pt-5 pt-0 `}>{children}</div>;
};

const Tabs: FC<
  PropsWithChildren<{ tabs: Tab[]; setActiveTab: Function; activeTab: number }>
> = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <ul className="cursor-pointer m-0 px-0 list-none inline-flex flex-wrap rounded-t-lg text-sm font-small text-center text-gray-500 dark:text-gray-400">
      {tabs.map((tab, index) => {
        return (
          <li key={index} className="mr-2 mt-0">
            <button
              onClick={() => setActiveTab(index)}
              className={`inline-flex items-center ${
                activeTab === index
                  ? 'bg-zinc-900 text-neutral-300 hover:text-neutral-300 dark:text-gray-400'
                  : ''
              } px-2 rounded-t-lg border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group`}
            >
              npm-{index}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
