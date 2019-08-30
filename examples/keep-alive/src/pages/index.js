import { Card } from 'antd';
import Link from 'umi/link';

export default () => {
  return (
    <Card>
      <div>hello world</div>
      <Link to="/list">go to list</Link>
    </Card>
  );
};
