import * as React from 'react';
import useSWR from 'swr';
import { List, Tag, Button } from 'antd';
import Context from '../context';
import styles from './dailyReport.module.less';

const { useState, useEffect } = React;

const PAGE_SIZE = 5;

const DailyReport: React.SFC<{}> = props => {
  const { api } = React.useContext(Context);
  const { _ } = api;
  const [size, setSize] = React.useState(PAGE_SIZE);
  const { data: list } = useSWR('zaobao.list', async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.dashboard.zaobao.list',
    });
    return data;
  });
  const currentId = _.get(list, '0.id');

  const { data: detail } = useSWR(
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
  const length = Array.isArray(detail) ? detail.length : 0;

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

  return (
    <List
      itemLayout="horizontal"
      loading={!detail}
      className={styles.list}
      split={false}
      dataSource={Array.isArray(detail) ? detail.slice(0, size) : detail}
      loadMore={LoadMore}
      renderItem={item =>
        _.isPlainObject(item) && (
          <List.Item className={styles.listItem}>
            <List.Item.Meta
              title={
                <a target="_blank" rel="noopener noreferrer" href={item.href}>
                  {item.title} <Tag color="geekblue">{item.tag}</Tag>
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
