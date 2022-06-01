import { Button as XButton } from '@example/x-design';
import { Button } from 'antd';

const Home = () => {
  return (
    <div>
      <Button>我是按钮</Button>
      <XButton>basic button</XButton>
      <XButton primary>primary button</XButton>
      <h2 className="hello">我是hello</h2>
      <h3 className="x-test">test</h3>
    </div>
  );
};

export default Home;
