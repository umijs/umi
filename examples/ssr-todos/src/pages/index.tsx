import React, { useState } from 'react';
import { useServerLoaderData } from 'umi';
import {
  createTodos,
  deleteTodo,
  getTodoList,
  ITodo,
  updateTodo,
} from '../services/todos';
import styles from './index.css';

interface ITodoProps {
  data: ITodo;
  refresh: () => Promise<void>;
  onChange: (data: Partial<ITodo>) => void;
}

function Todo({ refresh, data, onChange }: ITodoProps) {
  const id = data.id!;

  const deleteHandler = async () => {
    console.log('Delete todo', id);
    await deleteTodo(id);
    await refresh();
  };

  const changeDoneHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Change todo', id, e.target.checked);
    await updateTodo({
      id,
      done: e.target.checked,
    });
    await refresh();
  };

  const changeTitleHandler = async () => {
    await updateTodo({
      id,
      title: data.title,
    });
    await refresh();
  };

  return (
    <div className={styles.todo}>
      <span>
        <input
          type="checkbox"
          checked={!!data.done}
          onChange={changeDoneHandler}
        />
      </span>
      <span>
        <input
          type="text"
          value={data.title}
          onChange={(e) => {
            onChange({
              title: e.target.value,
            });
          }}
        />
      </span>
      <span>
        <button onClick={changeTitleHandler}>Change</button>
        <button onClick={deleteHandler}>Delete</button>
      </span>
    </div>
  );
}

export default function HomePage() {
  const serverLoaderData = useServerLoaderData<typeof serverLoader>().data;
  const [todoList, setTodoList] = useState<ITodo[]>(
    serverLoaderData?.data || [],
  );

  const refresh = async () => {
    const { data } = await getTodoList();
    setTodoList(data!);
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.target as any as { title: { value: string } };
    await createTodos({
      title: target.title.value,
    });
    target.title.value = '';
    await refresh();
  };

  return (
    <div>
      <h2 className={styles.title}>Todos</h2>
      <div>
        <form onSubmit={submitHandler}>
          <input name="title" type="text" placeholder="to do something..." />
          <button type="submit">Add</button>
        </form>
      </div>
      <ul className={styles.todos}>
        {todoList.map((todo) => {
          return (
            <li key={todo.id}>
              <Todo
                data={todo}
                refresh={refresh}
                onChange={(data) => {
                  setTodoList((prev) => {
                    const targetIdx = prev.findIndex(
                      (item) => item.id === todo.id,
                    );
                    if (~targetIdx) {
                      const newData = {
                        ...prev[targetIdx],
                        ...data,
                      };
                      return [
                        ...prev.slice(0, targetIdx),
                        newData,
                        ...prev.slice(targetIdx + 1),
                      ];
                    }
                    return prev;
                  });
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export const serverLoader = async () => {
  const res = await getTodoList();
  return res;
};
