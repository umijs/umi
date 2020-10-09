import React from 'react';
import { Link } from 'umi';

export default function Layout(props) {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">/</Link>{' '}
        </li>
        <li>
          <Link to="/about">/about</Link>
        </li>
      </ul>
      {props.children}
    </div>
  );
}
