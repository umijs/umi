import React from 'react';
import type { FC } from 'react';

const ListLayout: FC = ({ children }) => {
  return (
    <div>
      <h2>List Layout</h2>
      {children}
    </div>
  );
};

export default ListLayout;
