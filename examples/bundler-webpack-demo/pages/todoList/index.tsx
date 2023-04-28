import styled from 'styled-components';
import CreateTodo from './components/CreateTodo';
import Filters from './components/Filters';
import Todos from './components/Todos';

const Wrapper = styled.article`
  padding: 100px 15%;
`;

export const TodoList = () => {
  return (
    <Wrapper>
      <CreateTodo />
      <Filters />
      <Todos />
    </Wrapper>
  );
};
