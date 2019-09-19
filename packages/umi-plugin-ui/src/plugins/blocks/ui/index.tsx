import React, { useState, useEffect, useContext } from 'react';
import { Input, Button } from 'antd';
import { IUiApi } from 'umi-types';
import decamelize from 'decamelize';

import BlockList from './BlockList';
import styles from './index.module.less';

const { Search } = Input;

function nameToPath(name) {
  return `/${decamelize(name, '-')}`;
}

interface Props {
  api: IUiApi;
}

const BlocksViewer: React.FC<Props> = props => {
  const { api } = props;
  const { callRemote, intl } = api;
  const [blockAdding, setBlockAdding] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await callRemote({
        type: 'org.umi.block.list',
      });
      setBlocks(data);
      setLoading(false);
    })();
  }, []);

  function addHandler(block) {
    (async () => {
      const { defaultPath, url } = block;
      let path = defaultPath;
      const { exists } = await callRemote({
        type: 'org.umi.block.checkexist',
        payload: {
          path,
        },
      });

      // block 存在时加数字后缀找一个不存在的
      if (exists) {
        let count = 2;
        while (true) {
          const { exists } = await callRemote({
            type: 'org.umi.block.checkexist',
            payload: {
              path: `${path}-${count}`,
            },
          });
          if (exists) {
            count += 1;
          } else {
            path = `${path}-${count}`;
            break;
          }
        }
      }

      setBlockAdding(url);
      await callRemote({
        type: 'org.umi.block.add',
        payload: {
          url,
          path,
        },
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
      <div className={styles.blocklist}>
        <BlockList
          loading={loading}
          type="block"
          addingBlock={blockAdding}
          list={blocks}
          onAdd={block => {
            addHandler(block);
          }}
        />
      </div>
    </div>
  );
};

export default BlocksViewer;
