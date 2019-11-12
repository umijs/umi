import * as React from 'react';
import useSWR from 'swr';
import { Select } from 'antd';
import { MESSAGES } from './dailyReport';
import Context from '../context';
import styles from './dailyReport.module.less';

const { useState, useEffect } = React;

const DailyReportHeader: React.SFC<{}> = props => {
  const { api } = React.useContext(Context);
  const { _, event, moment } = api;
  const { data: list } = useSWR('zaobao.list', async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.dashboard.zaobao.list',
    });
    return data;
  });

  const handleOnChange = value => {
    event.emit(MESSAGES.CHANGE_DAILY_ID, value);
  };

  return (
    <div className={styles['select-wrapper']}>
      {Array.isArray(list) && (
        <Select
          className={styles.select}
          defaultValue={_.get(list, '0.id')}
          onChange={handleOnChange}
        >
          {(list || []).map(item => (
            <Select.Option key={`${item.id}`} value={item.id}>
              {moment(item.createdAt).format('YYYY-MM-DD')}
            </Select.Option>
          ))}
        </Select>
      )}
    </div>
  );
};

export default DailyReportHeader;
