import { Button as AntdButton } from 'antd';
import { Button } from 'antd-mobile';
import { useState, useCallback } from 'preact/hooks';

export default () => {
  const [value, setValue] = useState(0);
  const increment = useCallback(() => setValue(value + 1), [value]);

  return (
    <>
      <h1>index</h1>
      <div>
        <h2>antd & antd-mobile</h2>
        <AntdButton type="primary">antd button</AntdButton>
        <Button type="primary">antd-mobile button</Button>
      </div>
      <h3>count: {value}</h3>
      <button className="increment" onClick={increment}>Increment</button>
    </>
  )
};
