import { Button } from 'antd-mobile';
import Link from 'umi/link';

export default function() {
  return (
    <div>
      <h1>Index Page</h1>
      <ul>
        <li>
          <Link to="/list">go to /list</Link>
        </li>
        <li>
          <Link to="/users/chencheng">go to /users/chencheng</Link>
        </li>
      </ul>
    </div>
  );
}
