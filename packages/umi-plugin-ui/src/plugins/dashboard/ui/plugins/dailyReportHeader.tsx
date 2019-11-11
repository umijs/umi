import * as React from 'react';
import useSWR from 'swr';
import moment from 'moment';
import { Select } from 'antd';
import Context from '../context';

const { useState, useEffect } = React;

interface DailyReportProps {}

const PAGE_SIZE = 5;

const DailyReportHeader: React.SFC<DailyReportProps> = props => {
  const { api } = React.useContext(Context);
  const { _, intl } = api;
  const { data: list } = useSWR('zaobao.list', async () => {
    const { data } = await api.callRemote({
      type: 'org.umi.dashboard.zaobao.list',
    });
    return data;
  });

  return (
    Array.isArray(list) && (
      <Select defaultValue={_.get(list, '0.id')}>
        {(list || []).map(item => (
          <Select.Option key={`${item.id}`} value={item.id}>
            {moment(item.createdAt).format('YYYY-MM-DD')}
          </Select.Option>
        ))}
      </Select>
    )
  );
};

export default DailyReportHeader;
