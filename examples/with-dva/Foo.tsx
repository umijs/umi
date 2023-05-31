import dva from 'dva';

const app = dva();
app.model({
  namespace: 'count',
  state: 0,
});
app.router(function (props) {
  return (
    <div>
      Foo {props.name} {props.app._store.getState().count}
    </div>
  );
});
const App = app.start();
export default App;
