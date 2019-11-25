import * as React from 'react';
import useSWR from 'swr';
import cls from 'classnames';
import { List, Tag, Typography } from 'antd';
import Context from '../context';
import styles from './dailyReport.module.less';

const { Paragraph } = Typography;
const { useState, useEffect } = React;

const PAGE_SIZE = 5;
const TAG_MAP = {
  发布: 'publish',
  文章: 'article',
  Star: 'star',
  star: 'star',
  Tweets: 'tweets',
};

export const MESSAGES = {
  CHANGE_DAILY_ID: Symbol('CHANGE_DAILY_ID'),
};

const DailyReport: React.SFC<{}> = props => {
  const { forceUpdate } = props;
  const { api } = React.useContext(Context);
  const { _, event } = api;
  const { formatMessage } = api.intl;
  const [size, setSize] = React.useState(PAGE_SIZE);
  const { data: list } = useSWR('zaobao.list', async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.dashboard.zaobao.list',
    });
    return data;
  });
  const [currentId, setCurrentId] = useState();

  const changeCurrentId = newId => {
    if (newId) {
      setCurrentId(newId);
      setSize(PAGE_SIZE);
    }
  };

  useEffect(
    () => {
      const id = _.get(list, '0.id');
      if (id) {
        setCurrentId(id);
      }
    },
    [list],
  );

  useEffect(() => {
    event.on(MESSAGES.CHANGE_DAILY_ID, changeCurrentId);
    return () => {
      event.off(MESSAGES.CHANGE_DAILY_ID, changeCurrentId);
    };
  }, []);

  const { data } = useSWR(
    () => `zaobao.list.detail.${currentId}`,
    async query => {
      const id = Number(query.replace('zaobao.list.detail.', ''));
      if (id) {
        const { data } = await api.callRemote({
          type: 'org.umi.dashboard.zaobao.list.detail',
          payload: {
            id,
          },
        });
        return data;
      }
    },
  );

  useEffect(
    () => {
      forceUpdate();
    },
    [data],
  );

  const length = Array.isArray(data) ? data.length : 0;

  const handleLoadAll = () => {
    // load all
    setSize(length);
    // 重新计算瀑布流
    forceUpdate();
  };

  const LoadMore = size < length && (
    <div
      style={{
        textAlign: 'center',
        marginTop: 12,
        height: 32,
        lineHeight: '32px',
      }}
    >
      <a className={styles.more} onClick={handleLoadAll}>
        {formatMessage({ id: 'org.umi.ui.dashboard.card.zaobao.loadAll' })}
      </a>
    </div>
  );

  const getTagCls = name =>
    cls(styles['listItem-meta-tag'], {
      [styles[`listItem-meta-tag-${TAG_MAP[name] || TAG_MAP.Star}`]]: !!name,
    });

  return (
    <List
      itemLayout="horizontal"
      loading={!data}
      className={styles.list}
      split={false}
      dataSource={Array.isArray(data) ? data.slice(0, size) : data}
      loadMore={LoadMore}
      renderItem={item =>
        _.isPlainObject(item) && (
          <List.Item className={styles.listItem}>
            <List.Item.Meta
              className={styles['listItem-meta']}
              title={
                <a target="_blank" rel="noopener noreferrer" href={item.href}>
                  <Paragraph className={styles.paragraph} ellipsis>
                    {item.title}
                  </Paragraph>{' '}
                  <Tag className={getTagCls(item.tag)}>{item.tag}</Tag>
                </a>
              }
              description={<Paragraph ellipsis={{ rows: 3 }}>{item.description}</Paragraph>}
            />
          </List.Item>
        )
      }
    />
  );
};

export default DailyReport;
