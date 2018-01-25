import { Button } from 'antd-mobile';
import router from 'umi/router';

export default function(props) {
  const { name } = props.match.params;
  return (
    <div>
      <h1>User: {name}</h1>
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
