import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Spin, Radio, Button, message } from 'antd';
import { Reload } from '@ant-design/icons';
import { IUiApi } from 'umi-types';

import { Resource, Block } from '../../data.d';
import Context from './UIApiContext';
import BlockList from './BlockList';
import GlobalSearch from './search';
import useCallData from './hooks/useCallData';
import styles from './index.module.less';

const clearCache = async (api: IUiApi) => {
  try {
    const { data } = (await api.callRemote({
      type: 'org.umi.block.clear',
    })) as {
      data: string;
    };
    message.success(data);
  } catch (e) {
    message.error(e.message);
  }
};

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

  // 获取数据源
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

  // 对于 hooks 来说闭包会缓存 fetch ，所以这里定义一个
  // 这样每次都会新建一个 reloadData
  const reloadData = () => {
    fetch();
  };

  // 同理，需要放在这里
  const filterList = (data: Block[]) => {
    // according Search Input to filter
    if (searchValue && Array.isArray(data)) {
      const filterData = data.filter(
        // 描述 名字 tag 都应该匹配一下
        ({ name = '', description, tags }) =>
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          tags.join(',').includes(searchValue),
      );
      return filterData;
    }
    return data;
  };

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
  }, []);

  // 区块右上角的区域 三个按钮
  useEffect(
    () => {
      const handleSearchChange = (v: string) => {
        setSearchValue(v);
      };
      if (api.setActionPanel) {
        api.setActionPanel(() => [
          <GlobalSearch onChange={handleSearchChange} api={api} />,
          <Button style={{ padding: '0 8px' }} onClick={() => reloadData()}>
            <Reload />
          </Button>,
          <Button
            onClick={() => clearCache(api)}
            style={{
              padding: '0 8px',
            }}
          >
            <img
              width={16}
              height={16}
              alt="clear"
              src="https://gw.alipayobjects.com/zos/antfincdn/qI6Asiilu4/clear.svg"
            />
          </Button>,
        ]);
      }
    },
    [(current && current.id) || ''],
  );

  const matchedResources = resources.filter(r => r.blockType === type);

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
