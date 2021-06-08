import React from 'react';
import type { FC } from 'react';
import { observer, inject } from 'mobx-react';
import GloablModel from '@/stores/global';

interface LoginPageProps {
  global: GloablModel;
}
const LoginPage: FC<LoginPageProps> = ({ global }) => {
  return (
    <div>
      <h1>Login Page</h1>
      <button
        onClick={() => {
          global.signin();
        }}
      >
        Login
      </button>
    </div>
  );
};

export default inject('global')(observer(LoginPage));
