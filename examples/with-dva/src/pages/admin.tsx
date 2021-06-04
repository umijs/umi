import React from 'react';
import type { FC } from 'react';
import { Redirect, Link, connect, GlobalModelState, ConnectProps } from 'umi';

interface AdminProps extends ConnectProps {
  global: GlobalModelState;
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

export default connect(({ global }: { global: GlobalModelState }) => ({
  global,
}))(Admin);
