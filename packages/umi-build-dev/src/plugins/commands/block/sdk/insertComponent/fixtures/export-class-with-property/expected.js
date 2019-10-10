import Foo from './Foo';

class App extends React.Component {
  state: AccountCenterState = {
    newTags: [],
    inputVisible: false,
    inputValue: '',
    tabKey: 'articles',
  };

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
