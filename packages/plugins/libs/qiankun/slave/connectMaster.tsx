// @ts-nocheck
__USE_MODEL__;
import React from 'react';

const noop = () => {};

const connectMaster = <T extends object>(Component: React.ComponentType<T>) => {
  return (props: T, ...rest: any[]) => {
    const masterProps = (useModel || noop)('@@qiankunStateFromMaster') || {};
    return <Component {...props} {...rest} {...masterProps} />;
  };
};

export { connectMaster };
