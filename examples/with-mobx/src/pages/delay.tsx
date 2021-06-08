import React from 'react';
import type { FC } from 'react';
import { dynamic } from 'umi';
import { observer, inject } from 'mobx-react';
import { History } from 'history';
import GloablModel from '@/stores/global';
interface DynamicProps {
  global: GloablModel;
  history: History;
}

const DynamicPage: FC<DynamicProps> = ({ global, history, children }) => {
  return (
    <div>
      <h1>Test Delay {global.text}</h1>
      {children}
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

export default dynamic(
  () =>
    new Promise((resolve) => {
      console.log('delay start');
      setTimeout(() => {
        console.log('delay end');
        resolve(inject('global')(observer(DynamicPage)));
      }, 2000);
    }),
);
