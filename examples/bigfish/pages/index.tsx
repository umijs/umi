// @ts-ignore
import { history, useAccess, useIntl, useModel } from '@umijs/max';
// @ts-ignore
import { Button, DatePicker, Input } from 'antd';

export default function HomePage() {
  const { initialState } = useModel('@@initialState');
  console.log('initialState', initialState);
  const access = useAccess();
  console.log('access', access);
  const intl = useIntl();
  return (
    <div>
      <h2>index page</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
      <div>{intl.formatMessage({ id: 'HELLO' })}</div>
      <Button
        type="primary"
        onClick={() => {
          history.push('/users');
        }}
      >
        Go to /users
      </Button>
    </div>
  );
}
