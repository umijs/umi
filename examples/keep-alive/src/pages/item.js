import { Card, Button } from 'antd';
import router from 'umi/router';
import dropByCacheKey from 'umi/dropByCacheKey';

export default () => {
  const goBack = () => {
    router.push('/list');
  };
  const clearCache = () => {
    dropByCacheKey('/list');
  };
  return (
    <Card>
      <Button onClick={goBack}>goBack list page</Button>
      <Button onClick={clearCache}>clear list page cache</Button>
    </Card>
  );
};
