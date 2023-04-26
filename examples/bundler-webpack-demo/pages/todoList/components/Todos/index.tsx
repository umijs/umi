import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import styled from 'styled-components';
import { useSnapshot } from 'valtio';
import { FILTER_STR } from '../../interface';
import { removeTodo, store, toggleDone } from '../../store';

const Todos = () => {
  const snap = useSnapshot(store);

  const TodoWrapper = styled.section`
    border: 1px solid #1677ff;
  `;
  const TodoItem = styled.div`
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #ddd;
    justify-content: space-between;
  `;

  const TodoDoneIcon = styled(CheckOutlined)`
    margin-right: 20px;
  `;

  return (
    <TodoWrapper>
      {snap.todos
        .filter(({ status }) => status === snap.filter || snap.filter === 'all')
        .map(({ description, status, id }, index) => {
          return (
            <TodoItem key={id}>
              <div>
                <Tag color={FILTER_STR[status].color}>
                  {FILTER_STR[status].label}
                </Tag>
                <span
                  data-status={status}
                  style={{
                    textDecoration:
                      status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {description}
                </span>
              </div>
              <div>
                <TodoDoneIcon onClick={() => toggleDone(index, status)} />
                <CloseOutlined onClick={() => removeTodo(index)} />
              </div>
            </TodoItem>
          );
        })}
    </TodoWrapper>
  );
};
export default Todos;
