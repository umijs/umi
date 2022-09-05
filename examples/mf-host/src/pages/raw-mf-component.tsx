import { safeRemoteComponentWithMfConfig } from '@umijs/max';
import React from 'react';

const RemoteCounter = safeRemoteComponentWithMfConfig<
  React.FC<{ init?: number }>
>({
  mfConfig: {
    entry: 'http://localhost:9000/remote.js',
    moduleName: 'Counter',
    remoteName: 'remoteCounter',
  },
  fallbackComponent: () => 'raw Fallback',
  loadingElement: 'raw Loading',
});

export default () => {
  return (
    <div>
      <h1>MF Host using safeRemoteComponentWithMfConfig </h1>
      <RemoteCounter />
    </div>
  );
};
