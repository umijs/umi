import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Spin, Radio, Button, message } from 'antd';
import { Reload } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import { stringify, parse } from 'qs';

import { Resource, Block, AddBlockParams } from '../../data.d';
import Context from './UIApiContext';
import BlockList from './BlockList';
import GlobalSearch from './search';
import useCallData from './hooks/useCallData';
import styles from './index.module.less';
import Adder from './Adder';
import { ModelState, namespace } from './model';

/**
 * get substr from url
 */
const getQueryConfig = () => {
  const { type, resource } = parse(window.location.search.substr(1));
  return {
    type,
    resource,
  };
};

/**
 *  更新 search
 * @param params
 */
const updateUrlQuery = (params: { type: string; resource?: string }) => {
  const defaultParas = getQueryConfig();
  window.history.pushState(
    {},
    '',
    `?${stringify({
      ...defaultParas,
      ...params,
    })}`,
  );
};

const clearCache = async (api: IUiApi) => {
  try {
    const { data } = (await api.callRemote({
      type: 'org.umi.block.clear',
    })) as {
      data: string;
    };

    // 用户记忆的参数
    localStorage.remove('umi-ui-block-removeLocale');
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

interface Props {
  dispatch: (params: any) => {};
  loading: boolean;
  block: ModelState;
}

const BlocksViewer: React.FC<Props> = props => {
  const { dispatch, block, loading: fetchDataLoading } = props;
  const { api } = useContext(Context);
  const { callRemote } = api;
  const [willAddBlock, setWillAddBlock] = useState<Block>(null);
  const [addingBlock, setAddBlock] = useState<Block>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [blockParams, setBlockParams] = useState<AddBlockParams>(null);
  const [type, setType] = useState<Resource['blockType']>('block');
  const [activeResource, setActiveResource] = useState<Resource>(null);
  const [searchValue, setSearchValue] = useState<string>('');

  useEffect(() => {
    const query = getQueryConfig();
    if (query.type) {
      setType(query.type);
    } else {
      updateUrlQuery({ type });
    }
    if (query.resource) {
      setActiveResource(query.resource);
    }
  }, []);
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
  const blocks = current && block.blockData[current.id] ? block.blockData[current.id] : [];

  // 初始化 block dva model data
  useEffect(
    () => {
      if (current) {
        dispatch({
          type: `${namespace}/fetch`,
          payload: {
            resourceId: current.id,
          },
        });
      }
    },
    [current],
  );

  const reloadData = () => {
    dispatch({
      type: `${namespace}/fetch`,
      payload: {
        resourceId: current.id,
        reload: true,
      },
    });
  };

  useEffect(() => {
    /**
     * 获取上次的安装的区块 url
     * 成功之后会被清除
     */
    callRemote({
      type: 'org.umi.block.get-adding-block-url',
    }).then(({ data }: { data: Block }) => {
      if (data) {
        setWillAddBlock(data);
        // 我把每个 item 都加了一个 id，就是他的 url
        scrollToById(data.url, 'block-list-view');
      }
    });
  }, []);

  // 区块右上角的区域 三个按钮
  useEffect(() => {
    const isMini = api.isMini();
    const buttonPadding = isMini ? '0 4px' : '0 8px';

    const handleSearchChange = (v: string) => {
      setSearchValue(v);
    };
    if (api.setActionPanel) {
      api.setActionPanel(() => [
        <GlobalSearch key="global-search" onChange={handleSearchChange} api={api} />,
        <Button key="reload" style={{ padding: buttonPadding }} onClick={() => reloadData()}>
          <Reload />
        </Button>,
        <Button
          key="clear"
          onClick={() => clearCache(api)}
          style={{
            padding: buttonPadding,
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
  }, []);

  const matchedResources = resources.filter(r => r.blockType === type);

  return (
    <>
      <div className={styles.container} id="block-list-view">
        {current ? (
          <div className={styles.blockList}>
            <Tabs
              className={styles.tabs}
              activeKey={type}
              onChange={activeKey => {
                setType(activeKey as Resource['blockType']);
                updateUrlQuery({
                  type: activeKey,
                  resource: activeResource ? activeResource.id : undefined,
                });
              }}
            >
              <TabPane tab="区块" key="block" />
              <TabPane tab="模板" key="template" />
            </Tabs>
            {matchedResources.length > 1 && (
              <Radio.Group
                value={current.id}
                onChange={e => {
                  const resource = matchedResources.find(r => r.id === e.target.value);
                  setActiveResource(resource);
                  updateUrlQuery({ type, resource: resource.id });
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
                type={type}
                keyword={searchValue}
                addingBlock={willAddBlock || addingBlock}
                list={blocks}
                onShowModal={(currentBlock, option) => {
                  setAddModalVisible(true);
                  setWillAddBlock(currentBlock);
                  setBlockParams(option);
                }}
                loading={fetchDataLoading}
                onHideModal={() => {
                  setAddModalVisible(false);
                  setWillAddBlock(undefined);
                  setBlockParams(undefined);
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
      <Adder
        block={willAddBlock}
        blockType={type}
        {...blockParams}
        visible={addModalVisible}
        onAddBlockChange={addBlock => setAddBlock(addBlock)}
        onHideModal={() => {
          setAddModalVisible(false);
          setWillAddBlock(undefined);
          setBlockParams(undefined);
        }}
      />
    </>
  );
};

export default BlocksViewer;
