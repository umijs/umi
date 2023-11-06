import { Link } from 'umi';

export default (props) => {
  return (
    <div>
      <h1>layout</h1>
      <div>
        <button
          onClick={() => {
            props.history.goBack();
          }}
        >
          go back
        </button>
      </div>
      <ul>
        <li>
          <Link to="/">link to /</Link>
        </li>
        <li>route test</li>
        <ul>
          <li>
            <Link to="/route/1234?foo=bar">link to /route/1234?foo=bar</Link>
          </li>
          <li>
            <button
              onClick={() => {
                props.history.push({
                  pathname: '/route/1234',
                  query: { foo: 'bar' },
                });
              }}
            >
              history.push /route/1234?foo=bar
            </button>
          </li>
        </ul>
        <li>request test</li>
        <ul>
          <li>
            <Link to="/request">link to /reqeust</Link>
          </li>
        </ul>
      </ul>
      <div>{props.children}</div>
    </div>
  );
};
