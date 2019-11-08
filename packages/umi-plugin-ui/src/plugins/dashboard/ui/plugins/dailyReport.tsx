import * as React from 'react';
import cls from 'classnames';
import useSWR from 'swr';
import { List, Tag } from 'antd';
import Context from '../context';
import styles from './dailyReport.module.less';

const { useState, useEffect } = React;

interface DailyReportProps {}

const DailyReport: React.SFC<DailyReportProps> = props => {
  const { api } = React.useContext(Context);
  const { _ } = api;
  const { data: list } = useSWR('zaobao.list', async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.dashboard.zaobao.list',
    });
    return data;
  });
  const currentId = api._.get(list, '0.id');

  const { data: detail } = useSWR(
    () => `zaobao.list.detail.${currentId}`,
    async query => {
      const id = Number(query.replace('zaobao.list.detail.', ''));
      const { data } = await api.callRemote({
        type: 'org.umi.dashboard.zaobao.list.detail',
        payload: {
          id,
        },
      });
      return data;
    },
  );

  return (
    <List
      itemLayout="horizontal"
      loading={!detail}
      className={styles.list}
      split={false}
      dataSource={detail}
      renderItem={item => (
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
      )}
    />
  );
};

export default DailyReport;
