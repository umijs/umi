import { Button as AntdButton } from 'antd';
import { Button } from 'antd-mobile';

export default () => (
  <div>
    <h1>index</h1>
    <div>
      <h2>antd & antd-mobile</h2>
      <AntdButton type="primary">antd button</AntdButton>
      <Button type="primary">antd-mobile button</Button>
    </div>
  </div>
);
