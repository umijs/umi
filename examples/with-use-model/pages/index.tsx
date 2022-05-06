import React from 'react';
// @ts-ignore
import { useModel } from 'umi';

export default function HomePage() {
  const { todos } = useModel('todo');
  const { total } = useModel('count');
  return (
    <div>
      <h2>todos</h2>
      <ul>
        {todos.map((todo: string) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
      <h2>count</h2>
      <div>{total}</div>
    </div>
  );
}
