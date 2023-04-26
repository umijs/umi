import { Button, Input, Space } from 'antd';
import { useState } from 'react';
import { addTodo } from '../../store';

const CreateTodo = () => {
  const [value, setValue] = useState<string | undefined>();

  const onClick: () => void = () => {
    if (!value) {
      alert('请输入待办事项');
      return;
    }
    addTodo(value);
    setValue('');
  };

  return (
    <Space.Compact style={{ width: '100%' }}>
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
    </Space.Compact>
  );
};
export default CreateTodo;
