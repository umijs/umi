import { useAppData } from '@/hooks/useAppData';
import { ViewButton, ViewChart, ViewList } from '@/pages/imports/components';
import { Switch } from 'antd';
import { useState } from 'react';
import { styled } from 'umi';

// 暂定 list, chart 两个视图
const options = [
  {
    value: 'list',
    icon: 'bars-outlined',
  },
  {
    value: 'chart',
    icon: 'pie-chart-outlined',
  },
];

const Wrapper = styled.div`
  .switch-container {
    margin-top: 1rem;
    display: flex;
    align-items: center;

    .ant-switch {
      margin-right: 0.5rem;
      background: var(--text-color);

      &-checked {
        background: var(--highlight-color);
      }
    }
  }
`;

export default function Page() {
  const [viewType, setViewType] = useState('list');
  const [showNodeModules, setShowNodeModules] = useState(false);

  const { data } = useAppData();

  if (!data) return <div>Loading...</div>;

  const { metafile } = data.prepare.buildResult;

  console.log('data', data);
  const renderContent = () => {
    if (!metafile) {
      return <div>please set metaFile: true</div>;
    }

    switch (viewType) {
      case 'list':
        return (
          <ViewList showNodeModules={showNodeModules} metaFile={metafile} />
        );
      case 'chart':
        return <ViewChart />;
    }
  };

  return (
    <Wrapper>
      {/*<pre>*/}
      {/*  <CodeBlock code={data.prepare.buildResult} />*/}
      {/*</pre>*/}
      <div>
        <ViewButton
          value={viewType}
          options={options}
          onChange={(v: string) => setViewType(v)}
        />
      </div>
      <div className="switch-container">
        <Switch onChange={setShowNodeModules} />
        show node_modules paths
      </div>
      <div style={{ marginTop: '1rem' }}>{renderContent()}</div>
    </Wrapper>
  );
}
