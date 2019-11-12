import React from 'react';
import { DrawerProps } from 'antd/lib/drawer';
import { noop } from '../type';

export interface IResult {
  current: {
    visible: boolean;
    openDrawer: noop;
    closeDrawer: noop;
    config?: DrawerProps;
  };
}

export default (config?: DrawerProps): IResult => {
  const { visible: initVisible = false, ...restConfig } = config;
  const [visible, setVisible] = React.useState(initVisible);
  const openDrawer = () => {
    setVisible(true);
  };
  const closeDrawer = () => {
    setVisible(false);
  };
  const current = {
    visible,
    openDrawer,
    closeDrawer,
    ...restConfig,
  };
  return { current };
};
