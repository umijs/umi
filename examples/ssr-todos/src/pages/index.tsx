import React from 'react';
// @ts-ignore
import { useServerLoaderData, __useFetcher } from 'umi';
import { listTodos } from '../services/todos';
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

function Todo(props: { todo: Todo }) {
  const fetcher = __useFetcher();
  function deleteHandler() {
    console.log('Delete todo', props.todo.id);
    fetch(`/api/todos`, {
      method: 'DELETE',
      body: JSON.stringify({ id: props.todo.id }),
    })
      .then(() => {
        fetcher.load();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  function changeDoneHandler(e: any) {
    console.log('Change todo', props.todo.id);
    fetch(`/api/todos?id=${props.todo.id}`, {
      method: 'PUT',
      body: JSON.stringify({ done: e.target.checked }),
    })
      .then(() => {
        fetcher.load();
      })
      .catch((e) => {
        console.error(e);
      });
  }
  return (
    <div className={styles.todo}>
      <span>
        <input
          type="checkbox"
          checked={!!props.todo.attributes.done}
          onChange={changeDoneHandler}
        />
      </span>
      <span>{props.todo.attributes.title}</span>
      <span>
        <button onClick={deleteHandler}>Delete</button>
      </span>
    </div>
  );
}

function Todos() {
  const { data }: { data: Todo[] } = useServerLoaderData();
  return (
    <ul className={styles.todos}>
      {data.map((todo) => {
        return (
          <li key={todo.id}>
            <Todo todo={todo} />
          </li>
        );
      })}
    </ul>
  );
}

function Creator() {
  const fetcher = __useFetcher();
  function submitHandler(e: any) {
    e.preventDefault();
    const title = e.target.title.value;
    e.target.title.value = '';
    console.log('Create todo', title);
    fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
      .then(() => {
        fetcher.load();
      })
      .catch((e) => {
        console.error(e);
      });
  }
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
      <Todos />
      <Creator />
    </div>
  );
}

export async function serverLoader() {
  return await listTodos();
}
