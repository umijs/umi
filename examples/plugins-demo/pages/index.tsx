// @ts-ignore
import { Button, DatePicker, Input } from 'antd';
import React from 'react';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  return (
    <div>
      <h1 className={styles.title}>Ant Design</h1>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
    </div>
  );
}
