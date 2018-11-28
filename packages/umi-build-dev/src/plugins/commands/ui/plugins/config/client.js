import React from 'react';
import { connect } from 'dva';

const ConfigManager = connect(state => ({
  config: state.config,
}))(props => {
  return (
    <div>
      <h3>config mangager page</h3>
    </div>
  );
});

export default api => {
  api.addPanel({
    title: 'Config Manager',
    path: '/config',
    component: ConfigManager,
    models: [require('./model').default],
  });
};
