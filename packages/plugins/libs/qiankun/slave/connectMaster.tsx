// @ts-nocheck
__USE_MODEL__;
import React from 'react';
import { qiankunStateFromMasterModelNamespace } from './constants';

const noop = () => {};

const connectMaster = <T extends object>(Component: React.ComponentType<T>) => {
  return (props: T, ...rest: any[]) => {
    const masterProps =
      (useModel || noop)(qiankunStateFromMasterModelNamespace) || {};
    return <Component {...props} {...rest} {...masterProps} />;
  };
};

export { connectMaster };
