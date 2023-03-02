import type { Metafile } from '@umijs/bundler-utils/compiled/esbuild';
import { Input, List } from 'antd';
import VirtualList from 'rc-virtual-list';
import { FC, useMemo, useState } from 'react';
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
    color: var(--text-color);
    border-color: var(--text-color);
    padding-left: 1rem;
  }
`;

// 虚拟列表 item 高度不知道为啥是47
const ItemHeight = 47;
const exclude: RegExp[] = [/node_modules/];
const isExclude = (path: string) => {
  return exclude.some((reg) => reg.test(path));
};

export const ViewList: FC<IProps> = ({ showNodeModules, metaFile }) => {
  const [ipt, setIpt] = useState('');

  const importsList = useMemo(() => {
    const { inputs } = metaFile;
    const list = Object.keys(inputs).reduce((acc, key) => {
      const imports = inputs[key].imports || [];
      const paths = imports
        .map((ipt) => ipt.path)
        .filter((path) => {
          const inSearch = path.indexOf(ipt) !== -1;
          return inSearch && (showNodeModules || !isExclude(path));
        });
      return [...acc, ...paths];
    }, [] as string[]);
    return Array.from(new Set(list)).sort();
  }, [metaFile, showNodeModules, ipt]);

  const ContainerHeight = useMemo(() => {
    const maxHeight = window.innerHeight - 200;
    const listHeight = ItemHeight * importsList.length;
    if (listHeight > maxHeight) {
      return maxHeight;
    }
    return listHeight;
  }, [importsList]);

  return (
    <div>
      <SearchContainer>
        <Input
          size="large"
          value={ipt}
          onChange={(e) => setIpt(e.target.value)}
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
            itemHeight={ItemHeight}
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
