import React from 'react';
import { connect } from 'dva';
import model from './model';

const BlocksViewer = connect(state => ({
  blocks: state.blocks,
}))(props => {
  function addHandler(name) {
    window.send('blocks', [name]);
  }

  return (
    <div>
      <h2>Search</h2>
      <h2>List</h2>
      <ul>
        {props.blocks.data.map(item => {
          return (
            <li key={item.name}>
              {item.name}
              <button onClick={addHandler.bind(null, item.name)}>add</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
});

export default api => {
  api.addPanel({
    title: 'Blocks Viewer',
    path: '/blocks',
    component: BlocksViewer,
    models: [model],
  });
};
