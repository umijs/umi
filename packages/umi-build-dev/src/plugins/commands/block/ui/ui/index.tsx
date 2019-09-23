import React, { useState, useEffect } from 'react';
import { Input, Button, Tabs, Spin } from 'antd';

import { IUiApi } from 'umi-types';
import decamelize from 'decamelize';

import { Resource, Block } from '../../data.d';
import BlockList from './BlockList';
import styles from './index.module.less';

const { Search } = Input;
const { TabPane } = Tabs;

function nameToPath(name) {
  return `/${decamelize(name, '-')}`;
}

interface Props {
  api: IUiApi;
}

const clearCache = async (api: IUiApi) =>
  api.callRemote({
    type: 'org.umi.block.clear',
  });

const BlocksViewer: React.FC<Props> = props => {
  const { api } = props;
  const { callRemote, intl } = api;
  const [blockAdding, setBlockAdding] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [current, setCurrent] = useState<Resource>(null);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = (await callRemote({
        type: 'org.umi.block.routes',
      })) as {
        data: any[];
      };
      console.log(data);
    })();
  }, []);
  useEffect(
    () => {
      if (!current) {
        return;
      }
      (async () => {
        setLoading(true);
        const { data } = (await callRemote({
          type: 'org.umi.block.list',
          payload: {
            reources: current.id,
          },
        })) as { data: Block[] };
        setBlocks(data);
        setLoading(false);
      })();
    },
    [current],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = (await callRemote({
        type: 'org.umi.block.resource',
      })) as {
        data: Resource[];
      };
      setResources(data);
      setCurrent(data[0]);
      setLoading(false);
    })();
  }, []);

  function addHandler(params) {
    (async () => {
      const { url } = params;
      // TODO check exists
      // let path = defaultPath;
      // const { exists } = await callRemote({
      //   type: 'org.umi.block.checkexist',
      //   payload: {
      //     path,
      //   },
      // });

      // block 存在时加数字后缀找一个不存在的
      // if (exists) {
      //   let count = 2;
      //   while (true) {
      //     const { exists } = await callRemote({
      //       type: 'org.umi.block.checkexist',
      //       payload: {
      //         path: `${path}-${count}`,
      //       },
      //     });
      //     if (exists) {
      //       count += 1;
      //     } else {
      //       path = `${path}-${count}`;
      //       break;
      //     }
      //   }
      // }

      setBlockAdding(url);
      await callRemote({
        type: 'org.umi.block.add',
        payload: params,
      });
      setBlockAdding(null);
    })();
  }

  return (
    <div className={styles.container}>
      <Search
        placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
        onSearch={value => console.log(value)}
      />
      <Button
        onClick={() => {
          clearCache(api);
        }}
      >
        清除
      </Button>
      {current ? (
        <div className={styles.blocklist}>
          <Tabs
            activeKey={current.id}
            onChange={activeKey => {
              setCurrent(resources.find(r => r.id === activeKey));
            }}
          >
            {resources.map(r => {
              return <TabPane tab={r.name} key={r.id} />;
            })}
          </Tabs>
          <BlockList
            _={api._}
            loading={loading}
            type="block"
            addingBlock={blockAdding}
            list={blocks}
            onAdd={params => {
              addHandler(params);
            }}
          />
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
