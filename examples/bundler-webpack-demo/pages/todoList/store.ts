import { random } from 'lodash';
import { proxy } from 'valtio';
import { Filter, Status, TodoItemProps } from './interface';

export const store = proxy<{ filter: Filter; todos: TodoItemProps[] }>({
  filter: 'all',
  todos: [],
});

export const addTodo = (description: string) => {
  store.todos.push({
    description,
    status: 'pending',
    id: random(1.2, 555555999.2),
  });
};

export const removeTodo = (index: number) => {
  store.todos.splice(index, 1);
};

export const toggleDone = (index: number, currentStatus: Status) => {
  const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  store.todos[index].status = nextStatus;
};

export const setFilter = (filter: Filter) => {
  store.filter = filter;
};
