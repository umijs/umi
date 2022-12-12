import { Button } from 'antd';
import React from 'react';
import HelloWorld from '@/components/HelloWorld';
// @ts-ignore
import { hello } from '@xx/utils';
// @ts-ignore
import styles from './index.less';

export default function Page() {
  return (
    <div>
      <h1>with vite</h1>
      <Button type="primary">antd btn</Button>
      <HelloWorld msg="world home" />
      <div className={styles.u} data-testid="utils">
        {hello()}
      </div>
    </div>
  );
}
