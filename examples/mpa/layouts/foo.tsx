import React from 'react';

export default (props: any) => {
  return (
    <div>
      <h2>foo layout</h2>
      {props.children}
    </div>
  );
};
