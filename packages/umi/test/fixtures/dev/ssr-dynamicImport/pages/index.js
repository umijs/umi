import { Link } from 'umi';

function App(props) {
  return (
    <div>
      <Link to="/news">news</Link>
      <h1>count: {props.count}</h1>
    </div>
  );
}

App.getInitialProps = async ({ store, route, isServer }) => {
  console.log('Index getInitialProps');
  return Promise.resolve({
    count: 0,
  });
};

export default App;
