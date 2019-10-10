import Foo from './Foo';
const App = Form.create()(() => (
  <div>
    <Foo />
    <h1>foo</h1>
  </div>
));
export default connect()(App);
