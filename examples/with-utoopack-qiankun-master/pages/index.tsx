import { Link } from '@umijs/max';
import React from 'react';

export default function HomePage() {
  return (
    <div>
      <h2>Utoopack Qiankun Master Page</h2>
      <Link to="/slave">
        <button type="button">open slave</button>
      </Link>
    </div>
  );
}
