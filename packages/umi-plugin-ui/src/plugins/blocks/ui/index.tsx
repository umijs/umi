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
      const blocks = await callRemote({
        type: 'blocks/fetch',
      });
      setBlocks(blocks);
      setLoading(false);
    })();
  }, []);

  function addHandler(name) {
    (async () => {
      let path = nameToPath(name);
      const blockExists = await callRemote({
        type: 'blocks/checkExists',
        payload: {
          path,
        },
      });

      // block 存在时加数字后缀找一个不存在的
      if (blockExists) {
        let count = 2;
        while (true) {
          const blockExists = await callRemote({
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
      await callRemote({
        type: 'blocks/add',
        payload: {
          name,
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

export default BlocksViewer;
