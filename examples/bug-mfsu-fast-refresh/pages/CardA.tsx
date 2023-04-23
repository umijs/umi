import React from 'react';
import { getReact } from '../foo';

const CardA = () => {
  console.log(getReact());
  return <div>CardA</div>;
};

export default CardA;
