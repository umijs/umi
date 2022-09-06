import { Link } from 'umi';

export default function Layout(props: any) {
  return (
    <div>
      <h2>global layout</h2>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/users">/users</Link>
        </li>
        <li>
          <Link to="/users/foo">/users/foo</Link>
        </li>
        <button
          onClick={() => {
            props.history.push('/about');
          }}
        >
          go to /about
        </button>
        <button
          onClick={() => {
            props.history.replace('/about');
          }}
        >
          replace to /about
        </button>
      </ul>
      {props.children}
    </div>
  );
}
