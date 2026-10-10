import { Link } from '@umijs/max';
import React from 'react';

export default function HomePage() {
  return (
    <div>
      <h2>qiankun keepAlive demo</h2>
      <p>
        Open App1 / App2, switch between them, then come back — micro app state
        should be restored. Tabs below the header are draggable; closing a tab
        drops <code>qiankun_&lt;base&gt;</code>.
      </p>
      <ul>
        <li>
          <Link to="/app1/">Open App1</Link>
        </li>
        <li>
          <Link to="/app2/">Open App2</Link>
        </li>
      </ul>
    </div>
  );
}
