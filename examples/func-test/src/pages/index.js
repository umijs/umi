import { Card } from 'antd';
import history from 'umi/router';

export default () => {
  return (
    <Card
      onClick={() => {
        history.push('/testhistory');
      }}
    >
      <div>hello world</div>
    </Card>
  );
};
