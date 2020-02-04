import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { Spin, Radio, Button, message, Tooltip } from 'antd';
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import { stringify, parse } from 'qs';

import { Clear } from './icon';
import { Resource, Block, AddBlockParams } from '../../data.d';
import BlockList from './BlockList';
import GlobalSearch from './GlobalSearch';
import useCallData from './hooks/useCallData';
import styles from './BlocksViewer.module.less';
import Adder from './Adder';
import AssetsMenu from './AssetsMenu';
import { ModelState, namespace } from './model';
import Container from './Container';

/**
 * get substr from url
 */
const getQueryConfig = () => parse(window.location.search.substr(1));

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
    const hide = message.loading('缓存清理中！');
    const { data } = (await api.callRemote({
      type: 'org.umi.block.clear',
    })) as {
      data: string;
    };

    // 用户记忆的参数
    localStorage.removeItem('umi-ui-block-removeLocale');
    hide();
    // 等动画播放完
    setTimeout(() => {
      message.success(data);
    }, 30);
  } catch (e) {
    message.error(e.message);
  }
};

const openUmiBlocks = () => {
  window.open('https://github.com/umijs/umi-blocks');
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

interface Props {
  dispatch: (params: any) => {};
  loading: boolean;
  block: ModelState;
}

/**
 * 渲染 数据源选择器
 * @param param0
 */
const renderActiveResourceTag = ({
  type,
  matchedResources = [],
  current = { id: '' },
  setActiveResource,
}: {
  type: string;
  current: Resource;
  matchedResources: Resource[];
  setActiveResource: (value: Resource) => void;
}) => {
  if (matchedResources.length > 1) {
    return (
      <Radio.Group
        value={current.id}
        size="small"
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
    );
  }
  if (matchedResources.length === 1) {
    return (
      <h3
        style={{
          marginTop: 8,
        }}
      >
        {matchedResources[0].name}
      </h3>
    );
  }
  return null;
};

const BlocksViewer: React.FC<Props> = props => {
  const { dispatch, block, loading: fetchDataLoading } = props;
  const { api, type, setType, activeResource, setActiveResource } = Container.useContainer();
  const { callRemote, intl } = api;
  /**
   * 是不是umi
   */
  const isMini = api.isMini();

  /**
   * 用到的各种状态
   */
  const [willAddBlock, setWillAddBlock] = useState<Block>(null);
  const [addingBlock, setAddBlock] = useState<Block>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [blockParams, setBlockParams] = useState<AddBlockParams>(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  /**
   * 获取 query 中的设置
   */
  useLayoutEffect(() => {
    // 更新一下url，让他们同步一下
    if (type) {
      updateUrlQuery({ type });
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
  // 当前的数据源列表
  const current = useMemo<Resource>(
    () => {
      return activeResource || resources.filter(item => item.blockType === type)[0];
    },
    [resources, activeResource, type],
  );
  // 计算选中的区块
  const blocks = useMemo<Block[]>(
    () => {
      return current && block.blockData[current.id] ? block.blockData[current.id] : [];
    },
    [block, current],
  );

  // 初始化 block dva model data
  useEffect(
    () => {
      if (current && current.id) {
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

  useEffect(() => {
    /**
     * 获取上次的安装的区块 url
     * 成功之后会被清除
     */
    callRemote({
      type: 'org.umi.block.get-adding-block-url',
    }).then(({ data }: { data: string }) => {
      if (data) {
        setAddBlock({ url: data });
      }
    });
  }, []);

  // 如果区块不在屏幕范围内，滚动过去
  useEffect(
    () => {
      if (willAddBlock) {
        // 我把每个 item 都加了一个 id，就是他的 url
        scrollToById(willAddBlock.url, 'block-list-view');
      }
    },
    [fetchDataLoading],
  );

  // 区块右上角的区域 三个按钮
  useEffect(() => {
    const buttonPadding = isMini ? '0 4px' : '0 8px';

    const handleSearchChange = (v: string) => {
      setSearchValue(v.toLocaleLowerCase());
    };

    if (api.setActionPanel) {
      api.setActionPanel(() => [
        <GlobalSearch key="global-search" onChange={handleSearchChange} api={api} />,
        <Tooltip
          title={intl({ id: 'org.umi.ui.blocks.actions.reload' })}
          getPopupContainer={node => (node ? (node.parentNode as HTMLElement) : document.body)}
          placement="bottom"
        >
          <Button
            size={isMini ? 'small' : 'default'}
            key="reload"
            style={{ padding: buttonPadding }}
            onClick={() => {
              dispatch({
                type: `${namespace}/fetch`,
                payload: {
                  reload: true,
                },
              });
            }}
          >
            <ReloadOutlined />
          </Button>
        </Tooltip>,
        <Tooltip
          title={intl({ id: 'org.umi.ui.blocks.actions.clear' })}
          getPopupContainer={node => (node ? (node.parentNode as HTMLElement) : document.body)}
          placement="bottom"
        >
          <Button
            size={isMini ? 'small' : 'default'}
            key="clear"
            onClick={() => clearCache(api)}
            style={{
              padding: buttonPadding,
            }}
          >
            <Clear />
          </Button>
        </Tooltip>,
        <Tooltip
          title={intl({ id: 'org.umi.ui.blocks.actions.submit' })}
          getPopupContainer={node => (node ? (node.parentNode as HTMLElement) : document.body)}
          placement="bottom"
        >
          <Button
            size={isMini ? 'small' : 'default'}
            key="clear"
            onClick={() => openUmiBlocks()}
            style={{
              padding: buttonPadding,
            }}
          >
            <PlusOutlined />
          </Button>
        </Tooltip>,
      ]);
    }
  }, []);

  const matchedResources = resources.filter(r => r.blockType === type);
  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.side}>
          <AssetsMenu
            type={type}
            matchedResources={matchedResources}
            setActiveResource={setActiveResource}
            updateUrlQuery={updateUrlQuery}
            setSelectedTag={setSelectedTag}
            selectedTag={selectedTag}
            current={current}
            blocks={blocks}
            loading={fetchDataLoading}
          />
        </div>
        <div className={styles.main}>
          <div className={`${styles.container} ${isMini && styles.min}`} id="block-list-view">
            {current ? (
              <div className={styles.blockList}>
                {matchedResources.length > 0 ? (
                  <BlockList
                    type={type}
                    keyword={searchValue}
                    addingBlock={willAddBlock || addingBlock}
                    list={blocks}
                    setSelectedTag={setSelectedTag}
                    selectedTag={selectedTag}
                    onShowModal={(currentBlock, option) => {
                      setAddModalVisible(true);
                      setWillAddBlock(currentBlock);
                      setBlockParams(option);
                    }}
                    loading={fetchDataLoading}
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
        </div>
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
