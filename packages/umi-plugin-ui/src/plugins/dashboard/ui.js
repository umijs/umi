import React from 'react';

function Dashboard() {
  return <div>项目仪表盘</div>;
}

export default api => {
  api.addPanel({
    title: '项目仪表盘',
    path: '/dashboard',
    icon: 'environment',
    component: Dashboard,
  });
};
