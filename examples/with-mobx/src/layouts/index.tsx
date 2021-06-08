import React from 'react';
import type { FC } from 'react';
import { observer, inject } from 'mobx-react';
import GloablModel from '@/stores/global';

interface LayoutProps {
  global: GloablModel;
}

const Layout: FC<LayoutProps> = ({ global, children }) => {
  return (
    <div>
      <h1>MAIN LAYOUT {global.text}</h1>
      {children}
    </div>
  );
};

export default inject('global')(observer(Layout));
