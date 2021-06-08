import React from 'react';
import type { FC } from 'react';
import { History } from 'history';

interface ListPageProps {
  history: History;
}
const ListPage: FC<ListPageProps> = ({ history }) => {
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
