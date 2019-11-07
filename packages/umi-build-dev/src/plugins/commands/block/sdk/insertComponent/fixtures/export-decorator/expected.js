import Foo from './Foo';

@connect(mapStateToProps)
class App extends React.Component {
  render() {
    return (
      <div>
        <Foo />
        <h1>foo</h1>
      </div>
    );
  }
}

export default App;
