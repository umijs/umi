// @ts-nocheck
/* eslint-disable */
__USE_MODEL__;
import noop from 'lodash/noop';
import React from 'react';

const connectMaster = <T extends object>(Component: React.ComponentType<T>) => {
  return (props: T, ...rest: any[]) => {
    const masterProps = (useModel || noop)('@@qiankunStateFromMaster') || {};
    return <Component {...props} {...rest} {...masterProps} />;
  };
};

export { connectMaster };
