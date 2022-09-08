import React from 'react';

const Users = (props: any) => {
  return (
    <div>
      <h2>users layout</h2>
      {props.children}
    </div>
  );
};

export default Users;
