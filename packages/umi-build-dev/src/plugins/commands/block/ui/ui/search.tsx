import * as React from 'react';
import { Input } from 'antd';
import { Search as SearchIcon } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import styles from './search.module.less';

interface IGlobalSearch {
  api: IUiApi;
  onChange: (v: any) => void;
}

const GlobalSearch: React.SFC<IGlobalSearch> = props => {
  const { api, onChange } = props;
  const { intl } = api;
  return (
    <Input
      prefix={<SearchIcon />}
      className={styles.search}
      onChange={e => onChange(e.target)}
      placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
    />
  );
};

export default GlobalSearch;
