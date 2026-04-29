import { Navigate } from 'dumi';
import React from 'react';

const utoopackLinkStyle: React.CSSProperties = {
  color: '#0f766e',
  textDecoration: 'none',
  borderBottom: '1px solid #0f766e',
  paddingBottom: '2px',
};

function Notifier() {
  const [isEnglish, setIsEnglish] = React.useState(() =>
    typeof window !== 'undefined'
      ? window.location.href.includes('en-US')
      : false,
  );
  const utoopackConfigHref = isEnglish
    ? '/en-US/docs/api/config#utoopack'
    : '/docs/api/config#utoopack';

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
    <>
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
      <div
        style={{
          backgroundColor: '#f3f8f6',
          color: '#24312f',
          padding: '12px 16px',
          textAlign: 'center',
          borderBottom: '1px solid #d8e7e2',
        }}
      >
        {isEnglish ? (
          <>
            Try Rust Bundler{' '}
            <a
              href="https://github.com/utooland/utoo?from=umi"
              target="_blank"
              rel="noopener noreferrer"
              style={utoopackLinkStyle}
            >
              utoopack
            </a>{' '}
            for faster Umi builds.{' '}
            <a href={utoopackConfigHref} style={utoopackLinkStyle}>
              Learn more
            </a>
          </>
        ) : (
          <>
            试试 Rust Bundler{' '}
            <a
              href="https://github.com/utooland/utoo?from=umi"
              target="_blank"
              rel="noopener noreferrer"
              style={utoopackLinkStyle}
            >
              utoopack
            </a>
            ，让 Umi 构建更快。
            <a href={utoopackConfigHref} style={utoopackLinkStyle}>
              了解更多
            </a>
          </>
        )}
      </div>
    </>
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
