import React from 'react';

export default (props: any) => {
  console.log(props);
  return <h2>user: {props.params.id}</h2>;
};
