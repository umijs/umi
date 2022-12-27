import React from 'react';
import { MicroAppLink } from 'umi';
// @ts-ignore
import dogJpg from '@/imgs/dogs.jpeg';

export default function App2Page() {
  return (
    <div>
      <h2>App2 HelloPage</h2>
      <div>
        <img src={dogJpg} />
      </div>
      <MicroAppLink name="slave" to="/home">
        goto slave
      </MicroAppLink>
    </div>
  );
}
