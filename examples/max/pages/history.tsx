import React from 'react';
import { history, useSearchParams } from '@umijs/max';

export default function Page() {
  const [p] = useSearchParams();
  return (
    <div>
      <h1>History API</h1>

      <div>
        <button
          onClick={() => {
            history.replace({ search: '?t=replace' });
          }}
        >
          history.replace(search)
        </button>
      </div>

      <div>
        <button
          onClick={() => {
            history.push({ search: '?t=push' });
          }}
        >
          history.push(search)
        </button>
      </div>

      <div>
        <button
          onClick={() => {
            history.replace({ search: '?t=replace', pathname: '/' });
          }}
        >
          history.replace(pathname)
        </button>
      </div>

      <div>
        <button
          onClick={() => {
            history.push({ search: '?t=push', pathname: '/' });
          }}
        >
          history.push(pathname)
        </button>
      </div>

      <div>{p.toString()}</div>
    </div>
  );
}
