import * as React from 'react';
import { Input } from 'antd';
import { Search as SearchIcon } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import styles from './search.module.less';

interface IGlobalSearch {
  api: IUiApi;
  onChange: (v: string) => void;
}

const GlobalSearch: React.SFC<IGlobalSearch> = props => {
  const { api, onChange } = props;
  const { intl, _ } = api;
  const handleChangeDebounce = _.debounce(v => {
    onChange(v);
  }, 500);
  return (
    <Input
      prefix={<SearchIcon />}
      className={styles.search}
      onChange={e => handleChangeDebounce(e.target.value)}
      placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
    />
  );
};

export default GlobalSearch;
