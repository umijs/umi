import React, { useState } from 'react';
// @ts-ignore
import { useServerLoaderData, __useFetcher } from 'umi';
import {
  createTodos,
  deleteTodo,
  listTodos,
  updateTodo,
} from '../services/todos';
// @ts-ignore
import styles from './index.css';

interface Todo {
  id: string;
  attributes: {
    title: string;
    done: boolean;
    notes: string;
  };
}
let todosList = null;
function Todo({ todo, onData }: { todo: Todo; onData: (value: Todo) => {} }) {
  const fetcher = __useFetcher();
  const deleteHandler = async () => {
    console.log('Delete todo', todo.id);
    const { success, data } = await deleteTodo(todo.id);
    if (success) {
      todosList = data;
      fetcher.load();
    }
  };

  const changeDoneHandler = async (e: any) => {
    console.log('Change todo', todo.id, e.target.checked);
    const { success, data } = await updateTodo(todo.id, {
      done: e.target.checked,
    });
    if (success) {
      todosList = data;
      fetcher.load();
    }
  };

  const changeTitleHandler = async () => {
    const { success, data } = await updateTodo(todo.id, {
      title: todo.attributes.title,
    });
    if (success) {
      todosList = data;
      fetcher.load();
    }
  };

  return (
    <div className={styles.todo}>
      <span>
        <input
          type="checkbox"
          checked={!!todo.attributes.done}
          onChange={changeDoneHandler}
        />
      </span>
      <span>
        <input
          type="text"
          value={todo.attributes.title}
          onChange={(e) => {
            todo.attributes.title = e.target.value;
            onData(todo);
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

function Todos() {
  // useServerLoaderData 修改后获取的数据是旧的, 可能是个bug 正常情况是不需要setList(todosList)
  const { data }: { data: { data: Todo[] } } = useServerLoaderData();
  const [list, setList] = useState(data.data);

  if (todosList != null && JSON.stringify(list) != JSON.stringify(todosList)) {
    setList(todosList);
  }

  const handleDataFromChild = (childData: Todo) => {
    const idx = list.findIndex((item) => item.id == childData.id);
    list[idx] = childData;
    setList([...list]);
  };

  return (
    <ul className={styles.todos}>
      {list.map((todo) => {
        return (
          <li key={todo.id}>
            <Todo todo={todo} onData={handleDataFromChild} />
          </li>
        );
      })}
    </ul>
  );
}

function Creator() {
  const fetcher = __useFetcher();
  const submitHandler = async (e: any) => {
    e.preventDefault();
    const title = e.target.title.value;
    e.target.title.value = '';
    console.log('Create todo', title);
    const { success, data } = await createTodos({ title });
    if (success) {
      todosList = data;
      fetcher.load();
    }
  };

  return (
    <div>
      <form onSubmit={submitHandler}>
        <input name="title" type="text" placeholder="to do something..." />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      <h2 className={styles.title}>Todos</h2>
      <Creator />
      <Todos />
    </div>
  );
}

export const serverLoader = () => {
  return listTodos();
};
