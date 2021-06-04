import React from 'react';
import type { FC } from 'react';
import { ConnectProps, GlobalModelState, connect } from 'umi';
import { IntlProvider } from 'react-intl';

interface LayoutProps extends ConnectProps {
  global: GlobalModelState;
}

const Layout: FC<LayoutProps> = (props) => {
  return (
    <IntlProvider locale="en">
      <div>
        <h1>MAIN LAYOUT {props.global.text}</h1>
        {props.children}
      </div>
    </IntlProvider>
  );
};

export default connect(({ global }: { global: GlobalModelState }) => ({
  global,
}))(Layout);
