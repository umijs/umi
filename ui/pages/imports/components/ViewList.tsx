import type { Metafile } from '@umijs/bundler-utils/compiled/esbuild';
import { Input, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { FC, useMemo } from 'react';
import { Icon, styled } from 'umi';

interface IProps {
  showNodeModules: boolean;
  metaFile: Metafile;
}

const SearchContainer = styled.div`
  background: var(--bg-color);

  .ant-input-affix-wrapper {
    background: var(--bg-color);
    border-color: var(--text-color);
  }

  .ant-input {
    background: var(--bg-color);
    color: var(--text-color);
  }

  .search-icon {
    margin-right: 0.5rem;
    color: var(--text-color);
  }
`;

const ListContainer = styled.div`
  margin-top: 2rem;

  .ant-list-item {
    font-size: 1rem;
    color: var(--text-color);
    border-color: var(--text-color);
    padding-left: 1rem;
  }
`;

export const ViewList: FC<IProps> = ({ showNodeModules, metaFile }) => {
  const ContainerHeight = window.innerHeight - 200;

  const importsList = useMemo(() => {
    const { inputs } = metaFile;
    const list = Object.keys(inputs).reduce((acc, key) => {
      const imports = inputs[key].imports || [];
      const paths = imports.map((ipt) => ipt.path);
      return [...acc, ...paths];
    }, [] as string[]);
    return Array.from(new Set(list));
  }, [metaFile, showNodeModules]);

  return (
    <div>
      <SearchContainer>
        <Input
          size="large"
          placeholder="large size"
          prefix={
            <Icon
              width="24"
              height="24"
              icon="ant-design:search-outlined"
              className="search-icon"
            />
          }
        />
      </SearchContainer>
      <ListContainer>
        <List bordered>
          <VirtualList
            data={importsList}
            height={ContainerHeight}
            itemHeight={40}
            itemKey={(item) => item}
          >
            {(item: string, index) => (
              <List.Item>
                <div>{item}</div>
              </List.Item>
            )}
          </VirtualList>
        </List>
      </ListContainer>
    </div>
  );
};
