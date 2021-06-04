import React from 'react';
import type { FC } from 'react';
import { dynamic, connect, GlobalModelState, ConnectProps } from 'umi';

interface DynamicProps extends ConnectProps {
  global: GlobalModelState;
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
        resolve(
          connect(({ global }: { global: GlobalModelState }) => ({ global }))(
            DynamicPage,
          ),
        );
      }, 2000);
    }),
);
