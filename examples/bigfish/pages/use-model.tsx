// @ts-ignore
import { useModel } from '@@/plugin-model';
import React from 'react';

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
