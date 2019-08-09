import React from 'react';
import { Button } from 'antd';

export default api => {
  function Tasks() {
    return (
      <div>
        任务管理内容
        <Button onClick={() => api.showLogPanel()}>open log</Button>
        <Button onClick={() => api.hideLogPanel()}>close log</Button>
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
