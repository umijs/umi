import * as React from 'react';
import cls from 'classnames';
import { List } from 'antd';
import Context from '../context';
import styles from './dailyReport.module.less';

const { useState, useEffect } = React;

interface DailyReportProps {}

const DailyReport: React.SFC<DailyReportProps> = props => {
  const { api } = React.useContext(Context);
  const [list, setList] = React.useState();
  useEffect(() => {
    const getList = async () => {
      const result = await api.callRemote({
        type: 'org.umi.dashboard.zaobao.list',
      });
      if (result && Number(result.status) === 200) {
        setList(result.data);
      }
    };
    getList();
  }, []);

  return (
    <List
      itemLayout="horizontal"
      loading={!list}
      split={false}
      dataSource={list}
      renderItem={item => (
        <List.Item className={styles.listItem}>
          <List.Item.Meta
            title={
              <a target="_blank" rel="noopener noreferrer" href={item.html_url}>
                {item.title}
              </a>
            }
            description="描述"
          />
        </List.Item>
      )}
    />
  );
};

export default DailyReport;
