// @ts-ignore
import { useModel } from 'umi';

export default function HomePage() {
  const { todos } = useModel('todo', (model) => ({ todos: model.todos }));
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
