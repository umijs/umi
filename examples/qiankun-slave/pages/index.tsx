import React, { useState } from 'react';
// @ts-ignore
import { MicroAppWithMemoHistory } from '@umijs/max';
// @ts-ignore
import { Drawer } from 'antd';

export default function HomePage() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <h2>HomePage</h2>
      <button
        onClick={() => {
          setVisible(true);
        }}
      >
        打开 app2
      </button>

      <Drawer
        title="嵌入 app2"
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        width={800}
      >
        <MicroAppWithMemoHistory base="/app2" name="app2" url="/app2/hello" />
      </Drawer>
    </div>
  );
}
