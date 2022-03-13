import React from 'react';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    width: 100%;
    height: 100vh;
    font-family: 'Lucida Sans', sans-serif;
    margin: 0;
  }
`;

export const GlobalStyles: React.FC = (props) => (
  <>
    <GlobalStyle />
    {props.children}
  </>
);
