import React from 'react';
import type { FC } from 'react';
import { connect, history, ConnectProps, SearchModelState } from 'umi';

interface ListSearchProps extends ConnectProps {
  search: SearchModelState;
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

export default connect(({ search }: { search: SearchModelState }) => ({
  search,
}))(ListSearch);
