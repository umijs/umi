import React from 'react';

export default (props: any) => {
  return (
    <div>
      <h2>basic layout</h2>
      {props.children}
    </div>
  );
};
