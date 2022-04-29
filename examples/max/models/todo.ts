import { useModel } from '@umijs/max';
import { useState } from 'react';

export default function () {
  const initialState = useModel('@@initialState');
  console.log('initialState', initialState);
  const [todos, setTodos] = useState(['foo', 'bar']);
  return {
    todos,
    setTodos,
  };
}
