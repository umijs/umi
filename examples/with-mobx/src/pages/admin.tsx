import React from 'react';
import type { FC } from 'react';
import { Redirect } from 'umi';
import { observer, inject } from 'mobx-react';
import { History } from 'history';
import GloablModel from '@/stores/global';

interface AdminProps {
  global: GloablModel;
  history: History;
}

const Admin: FC<AdminProps> = ({ global, history }) => {
  if (global.login) {
    return (
      <div>
        <h1>Admin Page</h1>
        <button
          onClick={() => {
            history.push('/');
          }}
        >
          back
        </button>
      </div>
    );
  } else {
    return <Redirect to="/login" />;
  }
};

export default inject('global')(observer(Admin));
