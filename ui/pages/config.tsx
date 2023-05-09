import { ViewButton } from '@/components/imports/ViewButton';
import { useAppData } from '@/hooks/useAppData';
import { state as globalState } from '@/models/global';
import { useState } from 'react';
import ReactJson, { ThemeKeys } from 'react-json-view';
import { styled, useSnapshot } from 'umi';

type ConfigType = 'userConfig' | 'config';

const options = [
  {
    value: 'userConfig',
    str: 'UserConfig',
  },
  {
    value: 'config',
    str: 'FinalConfig',
  },
];

const Wrapper = styled.div``;

const JSONTheme: Record<string, ThemeKeys> = {
  dark: 'threezerotwofour',
  light: 'shapeshifter:inverted',
};

export default function Page() {
  const [viewType, setViewType] = useState<ConfigType>('userConfig');
  const { data } = useAppData();
  const { mode } = useSnapshot(globalState);

  if (!data) return <div>Loading...</div>;

  return (
    <Wrapper>
      <div>
        <ViewButton
          value={viewType}
          options={options}
          onChange={(v: string) => setViewType(v as ConfigType)}
        />
      </div>
      <div style={{ marginTop: '2rem' }}>
        <ReactJson
          theme={JSONTheme[mode]}
          style={{ backgroundColor: 'transparent' }}
          src={data[viewType]}
          iconStyle="square"
          onEdit={false}
          onAdd={false}
          onDelete={false}
          onSelect={false}
          enableClipboard={false}
          displayDataTypes={false}
          displayObjectSize={false}
        />
      </div>
    </Wrapper>
  );
}
