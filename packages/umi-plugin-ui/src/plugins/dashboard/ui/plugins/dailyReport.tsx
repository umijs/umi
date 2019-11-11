import * as React from 'react';
import useSWR from 'swr';
import { List, Tag, Button } from 'antd';
import cls from 'classnames';
import Context from '../context';
import styles from './dailyReport.module.less';

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
  const { api } = React.useContext(Context);
  const { _, event } = api;
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
    }
  };

  useEffect(
    () => {
      const id = _.get(list, '0.id');
      if (id) {
        setCurrentId(id);
        setSize(PAGE_SIZE);
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
  const length = Array.isArray(data) ? data.length : 0;

  const onLoadMore = () => {
    setSize(value => value + PAGE_SIZE);
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
      <Button onClick={onLoadMore}>加载更多</Button>
    </div>
  );

  const getTagCls = name =>
    cls(styles['listItem-meta-tag'], {
      [styles[`listItem-meta-tag-${TAG_MAP[name]}`]]: !!name,
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
                  {item.title} <Tag className={getTagCls(item.tag)}>{item.tag}</Tag>
                </a>
              }
              description={item.description}
            />
          </List.Item>
        )
      }
    />
  );
};

export default DailyReport;
