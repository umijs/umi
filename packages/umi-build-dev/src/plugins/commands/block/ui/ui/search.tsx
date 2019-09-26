import * as React from 'react';
import { Input } from 'antd';
import { Search as SearchIcon } from '@ant-design/icons';
import { IUiApi } from 'umi-types';
import styles from './search.module.less';

const { Search } = Input;

interface IGlobalSearch {
  api: IUiApi;
}

const GlobalSearch: React.SFC<IGlobalSearch> = props => {
  const { api } = props;
  const { intl } = api;
  return (
    <Input
      prefix={<SearchIcon />}
      className={styles.search}
      placeholder={intl({ id: 'org.umi.ui.blocks.content.search_block' })}
    />
  );
};

export default GlobalSearch;
