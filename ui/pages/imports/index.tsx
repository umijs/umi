import { useAppData } from '@/hooks/useAppData';
import { ViewButton, ViewChart, ViewList } from '@/pages/imports/components';
import { useState } from 'react';
import { styled } from 'umi';

const Wrapper = styled.div``;

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

export default function Page() {
  const [viewType, setViewType] = useState('list');

  const { data } = useAppData();

  if (!data) return <div>Loading...</div>;

  const { metafile } = data.prepare.buildResult;

  const renderContent = () => {
    if (!metafile) {
      return <div>please set metaFile: true</div>;
    }

    switch (viewType) {
      case 'list':
        return <ViewList metaFile={metafile} />;
      case 'chart':
        return <ViewChart metaFile={metafile} />;
    }
  };

  return (
    <Wrapper>
      <div>
        <ViewButton
          value={viewType}
          options={options}
          onChange={(v: string) => setViewType(v)}
        />
      </div>
      <div style={{ marginTop: '1rem' }}>{renderContent()}</div>
    </Wrapper>
  );
}
