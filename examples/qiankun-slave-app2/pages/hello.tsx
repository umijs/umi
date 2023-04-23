import React from 'react';
// @ts-ignore
import dogJpg from '@/imgs/dogs.jpeg';

export default function App2Page() {
  return (
    <div>
      <h2>App2 HelloPage</h2>
      <div>
        <img src={dogJpg} />
      </div>
    </div>
  );
}
