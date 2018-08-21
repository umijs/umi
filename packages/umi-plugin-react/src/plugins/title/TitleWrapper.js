import React from 'react';
import DocumentTitle from 'react-document-title';

export default props => {
  return (
    <DocumentTitle title={props.route.title}>{props.children}</DocumentTitle>
  );
};
