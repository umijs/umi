import { Button } from 'antd-mobile';
import router from 'umi/router';

export default function() {
  return (
    <div>
      <h1>List Page</h1>
      <Button
        onClick={() => {
          router.goBack();
        }}
      >
        返回
      </Button>
    </div>
  );
}
