import React from 'react';
import { Input } from 'antd';
import { IUiApi } from 'umi-types';

import { SearchOutlined } from '@ant-design/icons';
import styles from './GlobalSearch.module.less';

interface IGlobalSearch {
  onChange: (v: string) => void;
  api: IUiApi;
}

const GlobalSearch: React.SFC<IGlobalSearch> = props => {
  const { onChange, api } = props;
  const { intl, _ } = api;

  // 时间太长会造成卡顿的感觉，200-300 比较合适
  const handleChangeDebounce = _.debounce((value: string) => {
    onChange(value);
  }, 300);

  return (
    <Input
      prefix={<SearchOutlined />}
      className={styles.search}
      allowClear
      onChange={e => handleChangeDebounce(e.target.value)}
      placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
    />
  );
};

export default GlobalSearch;
