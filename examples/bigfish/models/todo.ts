import { useState } from 'react';

export default function () {
  const [todos, setTodos] = useState(['foo', 'bar']);
  return {
    todos,
    setTodos,
  };
}
