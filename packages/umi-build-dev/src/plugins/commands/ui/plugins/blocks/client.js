import React, { useState, useEffect } from 'react';
import { Input, Spin } from 'antd';
import styles from './client.module.less';

const { Search } = Input;

const BlocksViewer = props => {
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
      setBlockAdding(name);
      await window.callRemote({
        type: 'blocks/add',
        payload: {
          name,
          path: '/form/basic-form',
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
    title: 'Blocks Viewer',
    path: '/blocks',
    component: BlocksViewer,
  });
};
