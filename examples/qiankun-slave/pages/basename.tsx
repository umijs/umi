import React from 'react';
import { Link } from 'umi';

export default function RoutePage() {
  return (
    <div>
      <Link to="/">goto / with basename</Link>
    </div>
  );
}
