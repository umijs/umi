import { rawMfImport } from '@umijs/max';
import React, { Suspense } from 'react';

const RemoteCounter = React.lazy(() => {
  return rawMfImport({
    entry: 'http://localhost:9000/remote.js',
    moduleName: 'Counter',
    remoteName: 'remoteCounter',
  });
});

export default () => {
  const [c, setC] = React.useState(42);

  return (
    <div>
      <h1>MF Host</h1>
      <Suspense fallback="loading">
        <RemoteCounter />
      </Suspense>

      <h1> Host hooks</h1>

      <div>
        <button
          data-testid="host-button"
          onClick={() => {
            setC(c + 1);
          }}
        >
          Host Button
        </button>

        <span data-testid="host-counter">{c}</span>
      </div>
    </div>
  );
};
