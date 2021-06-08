import React from 'react';
import type { FC } from 'react';
import { history } from 'umi';
import { observer, inject } from 'mobx-react';
import SearchModel from '@/stores/search';

interface ListSearchProps {
  search: SearchModel;
}

const ListSearch: FC<ListSearchProps> = ({ search }) => {
  return (
    <div>
      <h1>{search.title}</h1>
      <button
        onClick={() => {
          history.goBack();
        }}
      >
        back
      </button>
    </div>
  );
};

export default inject('search')(observer(ListSearch));
