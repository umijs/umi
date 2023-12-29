import axios from 'axios';

axios.defaults.baseURL = `http://localhost:8000`;
const headers = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function listTodos() {
  return (await axios.get('/api/todos')).data;
}

export async function createTodos(data: { title: string }) {
  const body = JSON.stringify(data);
  return (await axios.post('/api/todos_add', body, { ...headers })).data;
}

export async function updateTodo(
  id: string,
  data: { title?: string; done?: boolean },
) {
  const body = JSON.stringify({ data, id });
  return (await axios.post('/api/todos_update', body, { ...headers })).data;
}

export async function deleteTodo(id: string) {
  return (
    await axios.post('/api/todos_delete', JSON.stringify({ id }), {
      ...headers,
    })
  ).data;
}
