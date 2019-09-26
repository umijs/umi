import React, { useState } from 'react';
import { Input, Tabs, Spin, Radio } from 'antd';
import { IUiApi } from 'umi-types';

import { Resource, Block } from '../../data.d';
import BlockList from './BlockList';
import useCallData from './hooks/useCallData';
import styles from './index.module.less';

const { Search } = Input;
const { TabPane } = Tabs;

interface Props {
  api: IUiApi;
}

const BlocksViewer: React.FC<Props> = props => {
  const { api } = props;
  const { callRemote, intl } = api;
  const [blockAdding, setBlockAdding] = useState(null);
  const [type, setType] = useState<Resource['blockType']>('block');
  const [activeResource, setActiveResource] = useState<Resource>(null);

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
  const { data: blocks, loading } = useCallData<Block[]>(
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
  function addHandler(params) {
    (async () => {
      const { url } = params;
      setBlockAdding(url);
      await callRemote({
        type: 'org.umi.block.add',
        payload: params,
      });
      setBlockAdding(null);
    })();
  }

  const matchedResources = resources.filter(r => r.blockType === type);

  return (
    <div className={styles.container} id="block-list-view">
      <Search
        placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
        onSearch={value => console.log(value)}
      />
      {current ? (
        <div className={styles.blocklist}>
          <Tabs
            activeKey={type}
            onChange={activeKey => {
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
              list={blocks}
              onAdd={params => {
                addHandler(params);
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
