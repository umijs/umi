import styled from 'styled-components';
import CreateTodo from './components/CreateTodo';
import Filters from './components/Filters';
import Todos from './components/Todos';

const TodoList = () => {
  const Wrapper = styled.article`
    padding: 100px 15%;
  `;
  return (
    <Wrapper>
      <CreateTodo />
      <Filters />
      <Todos />
    </Wrapper>
  );
};
export default TodoList;
