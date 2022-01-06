// @ts-ignore
import React from 'react';
import { useModel } from 'umi';

export default function HomePage() {
  const { todos } = useModel('todo');
  return (
    <div>
      <h2>todos</h2>
      <ul>
        {todos.map((todo: string) => (
          <li key={todo}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}
