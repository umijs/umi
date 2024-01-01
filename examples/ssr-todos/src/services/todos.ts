import axios from 'axios';

const request = axios.create({
  baseURL: `http://localhost:8000/api`,
  timeout: 10 * 1e3,
});

request.interceptors.response.use(
  (response) => {
    const isSuccess = response.data?.code === 0;
    if (!isSuccess) {
      return Promise.reject(response.data);
    }
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export interface ITodo {
  id?: string;
  title?: string;
  done?: boolean;
}

type IResponse<T> = Promise<{
  data: T | null;
  code: number;
  message?: string;
}>;

export function getTodoList() {
  return request.get('/todo/list') as IResponse<ITodo[]>;
}

export function createTodos(data: ITodo) {
  return request.post('/todo/add', data) as IResponse<ITodo>;
}

export function updateTodo(data: ITodo & { id: string }) {
  return request.post(`/todo/update`, data) as IResponse<ITodo>;
}

export function deleteTodo(id: string) {
  return request.post(`/todo/delete`, { id }) as IResponse<null>;
}
