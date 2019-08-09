import React from 'react';
import { Button } from 'antd';

export default api => {
  function Tasks() {
    return (
      <div>
        任务管理内容
        <Button onClick={() => api.showLog()}>open log</Button>
      </div>
    );
  }
  api.addPanel({
    title: '任务管理',
    path: '/tasks',
    icon: 'environment',
    component: Tasks,
  });
};
