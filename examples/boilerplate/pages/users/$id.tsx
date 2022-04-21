import React from 'react';

export default (props: any) => {
  console.log(props, props.searchParams.get('foo'), props.searchParams);
  return <h2>user: {props.params.id}</h2>;
};
