import React from 'react';

function Routes() {
  return (
    <div>
      <h3>routes page</h3>
    </div>
  );
}

export default api => {
  api.addPanel({
    title: 'Routes Manager',
    path: '/routes',
    component: Routes,
  });
};
