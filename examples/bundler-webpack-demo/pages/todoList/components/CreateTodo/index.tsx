import { Button, Input, message, Space } from 'antd';
import { useState } from 'react';
import styled from 'styled-components';
import { addTodo } from '../../store';

const SpaceCompact = styled(Space.Compact)`
  width: 100%;
`;

const CreateTodo = () => {
  const [value, setValue] = useState('');

  const onClick = () => {
    if (!value) {
      message.error('请输入待办事项');
      return;
    }
    addTodo(value);
    setValue('');
  };

  return (
    <SpaceCompact>
      <Input
        placeholder="请输入待办事项"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
      />
      <Button type="primary" onClick={onClick}>
        添加任务
      </Button>
    </SpaceCompact>
  );
};
export default CreateTodo;
