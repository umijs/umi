import { createGlobalStyle } from 'umi';

export const styledComponents = {
  GlobalStyle: createGlobalStyle`
    body {
      width: 100%;
      height: 100vh;
      font-family: 'Lucida Sans', sans-serif;
      margin: 0;
    }
  `,
};
