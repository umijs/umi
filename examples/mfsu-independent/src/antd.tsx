import 'antd/dist/antd.css';
import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import Input from 'antd/es/input';
import React from 'react';

export default () => {
  return (
    <div>
      <h1>Ant Design</h1>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
    </div>
  );
};
