// @ts-ignore
import { useModel } from '@@/plugin-model';
// @ts-ignore
import { Button, DatePicker, Input } from 'antd';
import React from 'react';

export default function HomePage() {
  const { initialState } = useModel('@@initialState');
  console.log('initialState', initialState);
  return (
    <div>
      <h2>index page</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
    </div>
  );
}
