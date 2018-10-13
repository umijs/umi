import { Card } from 'antd';
import history from 'umi/router';
import Link from 'umi/link';

export default () => {
  return (
    <Card>
      <div>hello world</div>
      <Link to="/test">test</Link>
    </Card>
  );
};
