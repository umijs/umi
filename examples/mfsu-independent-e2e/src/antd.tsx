import 'antd/dist/antd.css';
import { useState } from 'react';
import Button from 'antd/es/button';
import DatePicker from 'antd/es/date-picker';
import InputNumber from 'antd/es/input-number';
import React from 'react';

export default () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <h1>Ant Design</h1>
      <div>
        <Button
          type="primary"
          data-testid="mf-button"
          onClick={() => setCount((count) => count + 1)}
        >
          add count
        </Button>
      </div>
      <InputNumber
        data-testid="mf-counter"
        value={count}
        onChange={(v) => setCount(v || 0)}
      />
      <DatePicker />
    </div>
  );
};
