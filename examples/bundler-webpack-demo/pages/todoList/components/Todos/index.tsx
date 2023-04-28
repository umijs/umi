import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import styled from 'styled-components';
import { useSnapshot } from 'valtio';
import { FILTER_INFO_MAP } from '../../interface';
import { removeTodo, store, toggleDone } from '../../store';
import { FlexCenter } from '../../styles/layout';

const TodoWrapper = styled.section`
  border: 1px solid #1677ff;
`;

const TodoItem = styled(FlexCenter)`
  border-bottom: 1px solid #ddd;
`;

const TodoDoneIcon = styled(CheckOutlined)`
  margin-right: 20px;
`;

const Todos = () => {
  const snap = useSnapshot(store);

  return (
    <TodoWrapper>
      {snap.todos
        .filter(({ status }) => status === snap.filter || snap.filter === 'all')
        .map(({ description, status, id }, index) => {
          return (
            <TodoItem key={id}>
              <div>
                <Tag color={FILTER_INFO_MAP[status].color}>
                  {FILTER_INFO_MAP[status].label}
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
