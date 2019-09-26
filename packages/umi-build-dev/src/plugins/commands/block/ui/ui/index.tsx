import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Spin, Radio, Button } from 'antd';
import { Reload } from '@ant-design/icons';
import { Resource, Block } from '../../data.d';
import Context from './context';
import BlockList from './BlockList';
import GlobalSearch from './search';
import useCallData from './hooks/useCallData';
import styles from './index.module.less';

/**
 * 从 id 的 dom 滚动到 target 的 dom
 * @param id
 * @param target
 */
export const scrollToById = (id: string, target: string) => {
  const dom = document.getElementById(id);
  const targetDom = document.getElementById(target);
  if (dom && targetDom) {
    const axis = dom.getBoundingClientRect();
    targetDom.scrollTop = axis.top + axis.height / 2;
  }
};

const { TabPane } = Tabs;

const BlocksViewer: React.FC<{}> = () => {
  const { api } = useContext(Context);
  const { callRemote } = api;
  const [blockAdding, setBlockAdding] = useState(null);
  const [type, setType] = useState<Resource['blockType']>('block');
  const [activeResource, setActiveResource] = useState<Resource>(null);
  const [searchValue, setSearchValue] = useState<string>('');

  const { data: resources } = useCallData<Resource[]>(
    () =>
      callRemote({
        type: 'org.umi.block.resource',
      }) as any,
    [],
    {
      defaultData: [],
    },
  );

  const current: Resource | undefined =
    activeResource || resources.filter(item => item.blockType === type)[0];
  const { data: blocks, loading, fetch, setList } = useCallData<Block[]>(
    () => {
      if (!current) {
        return [];
      }
      return callRemote({
        type: 'org.umi.block.list',
        payload: {
          resourceId: current.id,
        },
      }) as any;
    },
    [(current && current.id) || ''],
    {
      defaultData: [],
    },
  );

  useEffect(() => {
    /**
     * 获取上次的安装的区块 url
     * 成功之后会被清除
     */
    callRemote({
      type: 'org.umi.block.get-adding-block-url',
    }).then(({ data }: { data: string }) => {
      setBlockAdding(data);
      // 我把每个 item 都加了一个 id，就是他的 url
      scrollToById(data, 'block-list-view');
    });
    const handleSearchChange = (v: string) => {
      setSearchValue(v);
    };
    if (api.setActionPanel) {
      api.setActionPanel(actions => [
        <GlobalSearch onChange={handleSearchChange} api={api} />,
        <Button style={{ padding: '0 8px' }} onClick={() => fetch()}>
          <Reload />
        </Button>,
        ...actions,
      ]);
    }
  }, []);

  const matchedResources = resources.filter(r => r.blockType === type);

  const filterList = data => {
    // according Search Input to filter
    if (searchValue && Array.isArray(data)) {
      const filterData = data.filter(item => (item.title || '').indexOf(searchValue) > -1);
      return filterData;
    }
    return data;
  };

  return (
    <div className={styles.container} id="block-list-view">
      {current ? (
        <div className={styles.blockList}>
          <Tabs
            className={styles.tabs}
            activeKey={type}
            onChange={activeKey => {
              setList([]);
              setType(activeKey as Resource['blockType']);
            }}
          >
            <TabPane tab="区块" key="block" />
            <TabPane tab="模板" key="template" />
          </Tabs>
          {matchedResources.length > 1 && (
            <Radio.Group
              value={current.id}
              onChange={e => {
                setList([]);
                setActiveResource(matchedResources.find(r => r.id === e.target.value));
              }}
            >
              {matchedResources.map(r => (
                <Radio.Button key={r.id} value={r.id}>
                  {r.name}
                </Radio.Button>
              ))}
            </Radio.Group>
          )}
          {matchedResources.length === 1 && <h3>{matchedResources[0].name}</h3>}
          {matchedResources.length > 0 ? (
            <BlockList
              api={api}
              loading={loading}
              type={type}
              addingBlock={blockAdding}
              list={filterList(blocks)}
              onAddClick={params => {
                setBlockAdding(params.url);
              }}
              onAddSuccess={() => {
                setBlockAdding(null);
              }}
            />
          ) : (
            <div>没有找到数据源</div>
          )}
        </div>
      ) : (
        <div className={styles.loading}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default BlocksViewer;
