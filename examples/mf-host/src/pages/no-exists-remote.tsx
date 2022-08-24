import { safeMfImport } from '@umijs/max';
import React, { Suspense } from 'react';

const RemoteCounter = React.lazy(() => {
  // ref to .umirc.ts utopia is a bad remote config
  return safeMfImport('oops/Counter', {
    default: () => 'everyone writes bugs',
  });
});

export default () => {
  return (
    <div>
      <h1>Page is Loaed</h1>
      <Suspense fallback={'loading'}>
        <RemoteCounter />
      </Suspense>
    </div>
  );
};
