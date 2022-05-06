// @ts-ignore
import { useModel } from 'umi';

export default function () {
  const { todos } = useModel('todo');
  const initialState = useModel('@@initialState');
  console.log('todos length', todos);
  console.log('initialState', initialState);
  return {
    total: 123,
  };
}
