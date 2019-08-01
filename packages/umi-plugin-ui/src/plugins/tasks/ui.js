import React from 'react';

function Tasks() {
  return <div>任务管理内容</div>;
}

export default api => {
  api.addPanel({
    title: '任务管理',
    path: '/tasks',
    icon: 'environment',
    component: Tasks,
  });
};
