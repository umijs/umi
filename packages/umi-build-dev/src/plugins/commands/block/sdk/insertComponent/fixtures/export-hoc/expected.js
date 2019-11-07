import Foo from './Foo';

const App = () => {
  return (
    <div>
      <Foo />
      <h1>foo</h1>
    </div>
  );
};

export default connect(mapStateToProps)(App);
