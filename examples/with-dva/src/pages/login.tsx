import React from 'react';
import type { FC } from 'react';
import { connect, ConnectProps } from 'umi';

const LoginPage: FC<ConnectProps> = ({ dispatch }) => {
  return (
    <div>
      <h1>Login Page</h1>
      <button
        onClick={() => {
          dispatch?.({
            type: 'global/login',
          });
        }}
      >
        Login
      </button>
    </div>
  );
};

export default connect()(LoginPage);
