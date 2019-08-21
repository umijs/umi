import React from 'react';
// import { IUiApi } from 'umi-types';
import Dashboard from './ui/index';

export default api => {
  api.addPanel({
    title: '总览',
    path: '/dashboard',
    icon: {
      type: 'dashboard',
      theme: 'filled',
    },
    component: Dashboard,
  });
};
