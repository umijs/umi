/*
title: testpage
 */
import { Card } from 'antd';
import router from 'umi/router';

export default () => {
  const goBack = () => {
    router.goBack();
  };
  return (
    <Card>
      <div onClick={goBack}>goBack list page</div>
    </Card>
  );
};
