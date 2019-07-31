import React, { useState, useEffect, useContext } from 'react';
import { Input, Spin } from 'antd';
import decamelize from 'decamelize';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import styles from './ui.module.less';

const { Search } = Input;

function nameToPath(name) {
  return `/${decamelize(name, '-')}`;
}

export default api => {
  const { callRemote } = api;

  const BlocksViewer = () => {
    const [blockAdding, setBlockAdding] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const { locale, formatMessage } = useContext(window.g_uiContext);
    console.log('locale', locale);

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

    return (
      <div className={styles.normal}>
        <Search
          placeholder={formatMessage({ id: 'search_block' })}
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
  api.addLocale({
    'zh-CN': zhCN,
    'en-US': enUS,
  });
  api.addPanel({
    title: 'blocks_title',
    path: '/blocks',
    icon: 'environment',
    component: BlocksViewer,
  });
};
