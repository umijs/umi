import { join } from 'path';

export default function(api) {
  const { RENDER } = api.placeholder;

  api.register('modifyEntryFile', ({ memo }) => {
    memo = memo.replace(
      '<%= RENDER %>',
      `
ReactDOM.render(
  React.createElement(
    require('${join(__dirname, './redux/index')}').default,
    null,
    React.createElement(require('./router').default),
  ),
  document.getElementById('root'),
);
      `.trim(),
    );
    return memo;
  });
}
