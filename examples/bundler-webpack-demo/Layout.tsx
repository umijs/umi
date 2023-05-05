import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  console.log('render Layout');
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2>layout</h2>
      <div>count: {count}</div>
      <div>
        <button
          onClick={() => {
            setCount((count) => count + 1);
          }}
        >
          add
        </button>
        <ul>
          <li>
            <Link to="/foo">Foo</Link>
          </li>
          <li>
            <Link to="/bar">Bar</Link>
          </li>
          <li>
            <Link to="/todolist">Todo List</Link>
          </li>
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
