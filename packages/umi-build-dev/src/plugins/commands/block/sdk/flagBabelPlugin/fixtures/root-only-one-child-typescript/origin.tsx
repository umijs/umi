import React from 'react';
import Media from 'react-media';

const BasicLayout = props =>
  React.createElement(Media, { query: '(max-width: 599px)' }, isMobile =>
    React.createElement('div', null, props.children),
  );
export default BasicLayout;
