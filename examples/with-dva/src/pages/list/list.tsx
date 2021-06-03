import React from 'react';
import type { FC } from 'react';
import { ConnectProps } from 'umi';

const ListPage: FC<ConnectProps> = ({ history }) => {
  return (
    <div>
      <h1>list/list</h1>
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

export default ListPage;
