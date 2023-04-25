import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, InputRef, Space, Tag } from 'antd';
import { random } from 'lodash';
import { Fragment, useRef, useState } from 'react';
import { proxy, useSnapshot } from 'valtio';
import './index.css';

type Status = 'pending' | 'completed';
type Filter = Status | 'all';
type Todo = {
  description: string;
  status: Status;
  id: number;
};
const FilterStr = {
  pending: { label: '未完成', color: '#f50' },
  completed: { label: '已完成', color: '#eee' },
  all: { label: '全部', color: '#87d068' },
};

export const store = proxy<{ filter: Filter; todos: Todo[] }>({
  filter: 'all',
  todos: [],
});

const addTodo = (description: string) => {
  store.todos.push({
    description,
    status: 'pending',
    id: random(1.2, 555555999.2),
  });
};

const removeTodo = (index: number) => {
  store.todos.splice(index, 1);
};

const toggleDone = (index: number, currentStatus: Status) => {
  const nextStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  store.todos[index].status = nextStatus;
};

const setFilter = (filter: Filter) => {
  store.filter = filter;
};

const filterValues: Filter[] = ['all', 'pending', 'completed'];

const CreateTodo = () => {
  const inputRef = useRef<InputRef | null>(null);
  const [value, setValue] = useState<string | undefined>();

  const onClick = () => {
    if (!value) {
      alert('请输入待办事项');
      return;
    }
    addTodo(value);
    setValue('');
  };

  const onChange = (event) => {
    const { value } = event.target;
    setValue(value);
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input placeholder="请输入待办事项" value={value} onChange={onChange} />
      <Button type="primary" onClick={onClick}>
        添加任务
      </Button>
    </Space.Compact>
  );
};

const Filters = () => {
  const snap = useSnapshot(store);
  return (
    <nav className="todo-header">
      <div>任务列表</div>
      <div>
        {filterValues.map((filter) => (
          <Fragment key={filter}>
            <Button
              onClick={() => setFilter(filter)}
              className="mr-20"
              style={{
                backgroundColor: snap.filter === filter ? 'lightgreen' : '#fff',
                color: snap.filter === filter ? '#fff' : '#000',
              }}
            >
              {FilterStr[filter].label}
            </Button>
          </Fragment>
        ))}
      </div>
    </nav>
  );
};

const Todos = () => {
  const snap = useSnapshot(store);
  return (
    <section className="todos">
      {snap.todos
        .filter(({ status }) => status === snap.filter || snap.filter === 'all')
        .map(({ description, status, id }, index) => {
          return (
            <div key={id} className="todos-item">
              <div>
                <Tag color={FilterStr[status].color}>
                  {FilterStr[status].label}
                </Tag>
                <span data-status={status} className="description">
                  {description}
                </span>
              </div>
              <div>
                <CheckOutlined
                  onClick={() => toggleDone(index, status)}
                  className="mr-20"
                />
                <CloseOutlined onClick={() => removeTodo(index)} />
              </div>
            </div>
          );
        })}
    </section>
  );
};

const TodoList = () => {
  const snap = useSnapshot(store);
  return (
    <article className="container">
      <CreateTodo />
      <Filters />
      <Todos />
    </article>
  );
};
export default TodoList;
