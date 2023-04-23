import { safeRemoteComponent } from '@umijs/max';
import React from 'react';

const RemoteCounter = safeRemoteComponent<React.FC<{ init?: number }>>({
  moduleSpecifier: 'remoteCounter/Counter',
  fallbackComponent: () => 'fallbacked',
  loadingElement: 'Loading',
});

export default () => {
  return (
    <div>
      <h1>MF Host using safeRemoteComponent</h1>
      <RemoteCounter init={808} />
    </div>
  );
};
