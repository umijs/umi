import createCache from '@emotion/cache';
import { CacheProvider, css, Global } from '@emotion/react';
import React from 'react';

const myCache = createCache({
  key: 'umi-emotion',
});
export const GlobalStyles: React.FC = (props) => (
  <>
    <CacheProvider value={myCache}>
      <Global
        styles={css`
          body {
            width: 100%;
            height: 100vh;
            font-family: 'Lucida Sans', sans-serif;
            margin: 0;
          }
        `}
      />
      {props.children}
    </CacheProvider>
  </>
);
