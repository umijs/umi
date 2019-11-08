import * as React from 'react';
import cls from 'classnames';
import { List, Tag } from 'antd';
import Context from '../context';
import styles from './dailyReport.module.less';

const { useState, useEffect } = React;

interface DailyReportProps {}

const DailyReport: React.SFC<DailyReportProps> = props => {
  const { api } = React.useContext(Context);
  const [list, setList] = React.useState();
  const [detail, setDetail] = React.useState();
  useEffect(() => {
    const getDetail = async () => {
      const result = await api.callRemote({
        type: 'org.umi.dashboard.zaobao.list',
      });
      const id = api._.get(result, 'data.0.id');
      console.log('id', id);
      const detail = await api.callRemote({
        type: 'org.umi.dashboard.zaobao.list.detail',
        payload: {
          id,
        },
      });
      console.log('detail', detail);
      if (detail && Number(detail.status) === 200) {
        setDetail(detail.data);
      }
    };
    getDetail();
  }, []);

  return (
    <List
      itemLayout="horizontal"
      loading={!detail}
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
