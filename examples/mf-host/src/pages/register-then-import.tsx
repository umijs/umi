import { registerMfRemote, safeMfImport } from '@umijs/max';
import React, { Suspense } from 'react';

registerMfRemote({
  aliasName: 'registered',
  remoteName: 'remoteCounter',
  entry: 'http://127.0.0.1:9000/remote.js',
});

const RemoteCounter = React.lazy(() => {
  return safeMfImport('registered/Counter', { defualt: null });
});

export default () => {
  return (
    <div>
      <h1>Register then Safe import</h1>
      <Suspense fallback="loading">
        <RemoteCounter />
      </Suspense>
    </div>
  );
};
