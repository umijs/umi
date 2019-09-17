import React, { useState, useEffect, useContext } from 'react';
import { Input, Spin, Button } from 'antd';
import { IUiApi } from 'umi-types';
import decamelize from 'decamelize';

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
  const { callRemote, getContext, intl } = api;
  const [blockAdding, setBlockAdding] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);
  // const { locale, formatMessage } = useContext(getContext());

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

  const handleNotify = () => {
    api.notify({
      title: 'org.umi.ui.blocks.notify.title',
      message: 'org.umi.ui.blocks.notify.message',
      type: 'success',
    });
  };

  return (
    <div className={styles.normal}>
      {/* <p>
        <pre>
          currentProject: {JSON.stringify(api.currentProject, null, 2)}
        </pre>
      </p> */}
      <Button onClick={() => api.showLogPanel()}>打开日志</Button>
      <Button onClick={handleNotify}>全局通知栏（当前窗口）</Button>
      <Button style={{ marginLeft: 8 }} onClick={() => setTimeout(handleNotify, 2000)}>
        全局通知栏（延迟 2 s，非当前窗口）
      </Button>

      <Button onClick={() => api.redirect('/configuration')}>跳转至配置页</Button>
      <Search
        placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
        onSearch={value => console.log(value)}
      />
      <div>{loading ? 'Fetching blocks...' : ''}</div>
      <div className={styles.blocklist}>
        {blocks.map((block, key) => {
          return (
            <div key={key} className={styles.block} onClick={addHandler.bind(null, block)}>
              {block.url === blockAdding ? (
                <Spin className={styles.spin} tip="Adding..." />
              ) : (
                <div />
              )}
              <div className={styles.blockTitle}>{block.name}</div>
              <img src={block.img} width="200" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlocksViewer;
