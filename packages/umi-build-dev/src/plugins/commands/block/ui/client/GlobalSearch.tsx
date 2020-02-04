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
  const { intl, hooks, _ } = api;
  let debounceFn = _.debounce;
  // compatible with prev version umi ui
  if (hooks?.useDebounceFn) {
    debounceFn = hooks.useDebounceFn;
  }

  // 时间太长会造成卡顿的感觉，200-300 比较合适
  const handleChange = debounceFn((value: string) => {
    onChange(value);
  }, 300);
  const handleChangeDebounce = handleChange?.run || handleChange;

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
