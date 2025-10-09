import { Navigate } from 'dumi';
import React from 'react';

function Notifier() {
  const [isEnglish, setIsEnglish] = React.useState(() =>
    typeof window !== 'undefined'
      ? window.location.href.includes('en-US')
      : false,
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleLocationChange = () => {
      setIsEnglish(window.location.href.includes('en-US'));
    };

    // Listen to popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);

    // Listen to pushstate/replacestate for SPA navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: '#000',
        color: '#fff',
        padding: '12px 16px',
        textAlign: 'center',
        borderBottom: '1px solid #333',
        fontFamily: 'Times, "Times New Roman", serif',
      }}
    >
      {isEnglish ? (
        <>
          Neovate Code is now open source.{' '}
          <a
            href="https://github.com/neovateai/neovate-code?from=umi"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fff',
              textDecoration: 'none',
              borderBottom: '1px solid #fff',
              paddingBottom: '2px',
            }}
          >
            Learn more
          </a>
        </>
      ) : (
        <>
          Neovate Code 现已开源。
          <a
            href="https://github.com/neovateai/neovate-code?from=umi"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fff',
              textDecoration: 'none',
              borderBottom: '1px solid #fff',
              paddingBottom: '2px',
            }}
          >
            了解更多
          </a>
        </>
      )}
    </div>
  );
}

function Wrapper(props: any) {
  return (
    <>
      <Notifier />
      {props.children}
    </>
  );
}

export function rootContainer(container: any) {
  return React.createElement(Wrapper, null, container);
}

export function patchClientRoutes({ routes }: any) {
  routes.push({
    path: '/docs/tutorials/getting-started',
    element: <Navigate to="/docs/guides/getting-started" replace />,
  });
}
