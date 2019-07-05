import React, { useState, useEffect } from 'react';
import { Input, Spin } from 'antd';
import decamelize from 'decamelize';
import styles from './client.module.less';

const { Search } = Input;

function nameToPath(name) {
  return `/${decamelize(name, '-')}`;
}

const BlocksViewer = () => {
  const [blockAdding, setBlockAdding] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const blocks = await window.callRemote({
        type: 'blocks/fetch',
      });
      setBlocks(blocks);
      setLoading(false);
    })();
  }, []);

  function addHandler(name) {
    (async () => {
      let path = nameToPath(name);
      const blockExists = await window.callRemote({
        type: 'blocks/checkExists',
        payload: {
          path,
        },
      });

      // block 存在时加数字后缀找一个不存在的
      if (blockExists) {
        let count = 2;
        while (true) {
          const blockExists = await window.callRemote({
            type: 'blocks/checkExists',
            payload: {
              path: `${path}-${count}`,
            },
          });
          if (blockExists) {
            count += 1;
          } else {
            path = `${path}-${count}`;
            break;
          }
        }
      }

      setBlockAdding(name);
      await window.callRemote({
        type: 'blocks/add',
        payload: {
          name,
          path,
        },
      });
      setBlockAdding(null);
    })();
  }

  return (
    <div className={styles.normal}>
      <Search placeholder="输入要搜索的区块名" onSearch={value => console.log(value)} />
      <div>{loading ? 'Fetching blocks...' : ''}</div>
      <div className={styles.blocklist}>
        {blocks.map((block, key) => {
          return (
            <div key={key} className={styles.block} onClick={addHandler.bind(null, block)}>
              {block === blockAdding ? <Spin className={styles.spin} tip="Adding..." /> : <div />}
              <div className={styles.blockTitle}>{block}</div>
              <img
                src={`https://raw.githubusercontent.com/ant-design/pro-blocks/master/${block}/snapshot.png`}
                width="200"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default api => {
  api.addPanel({
    title: '区块管理',
    path: '/blocks',
    component: BlocksViewer,
  });
};
