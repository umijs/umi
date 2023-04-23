import fetch from 'isomorphic-unfetch';

const API = 'http://localhost:1337/api/todos';
const AUTH_TOKEN_KEY = process.env.AUTH_TOKEN_KEY!;

export async function listTodos() {
  return await (
    await fetch(API, {
      headers: {
        Authorization: AUTH_TOKEN_KEY,
      },
    })
  ).json();
}

export async function createTodos(data: { title: string }) {
  const body = JSON.stringify({ data });
  return await (
    await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: AUTH_TOKEN_KEY,
        'Content-Type': 'application/json',
      },
      body,
    })
  ).json();
}

export async function updateTodo(
  id: string,
  data: { title?: string; completed?: boolean },
) {
  const body = JSON.stringify({ data });
  return await (
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: AUTH_TOKEN_KEY,
        'Content-Type': 'application/json',
      },
      body,
    })
  ).json();
}

export async function deleteTodo(id: string) {
  return await (
    await fetch(`${API}/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: AUTH_TOKEN_KEY,
        'Content-Type': 'application/json',
      },
    })
  ).json();
}
