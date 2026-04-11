import { Button } from 'antd';
import React from 'react';

export default function Page() {
  console.log(new URL('./plain.txt', import.meta.url).href);
  return (
    <div>
      <h1>with antd</h1>
      <Button type="primary">Button</Button>
    </div>
  );
}
