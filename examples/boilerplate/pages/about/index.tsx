import React from 'react';
import { useLocation } from 'umi';

export default () => {
  const location = useLocation();
  return <div>About {location.pathname}</div>;
};
