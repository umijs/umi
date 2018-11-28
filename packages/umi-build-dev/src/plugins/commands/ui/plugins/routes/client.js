import React from 'react';
import { connect } from 'dva';

const Routes = connect(state => ({
  routes: state.routes,
}))(props => {
  function renderRoutes(routes) {
    return (
      <ul>
        {routes.map((route, i) => {
          if (!route.path) return null;
          return (
            <li key={route.key || i}>
              <div>
                {route.path}
                <button
                  onClick={(route => {
                    window.send('rm', ['page', route.component]);
                  }).bind(null, route)}
                >
                  delete
                </button>
                <button>move</button>
              </div>
              {route.routes ? renderRoutes(route.routes) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      <h3>routes page</h3>
      <button
        onClick={() => {
          const name = window.prompt(`What's your page name?`);
          window.send('generate', ['page', name]);
        }}
      >
        add route
      </button>
      {renderRoutes(props.routes.data)}
    </div>
  );
});

export default api => {
  api.addPanel({
    title: 'Routes Manager',
    path: '/routes',
    component: Routes,
    models: [require('./model').default],
  });
};
