// @ts-ignore
import {
  FormattedMessage,
  history,
  Icon,
  useAccess,
  useIntl,
  useModel,
} from '@umijs/max';
// @ts-ignore
import { TestDecorator } from '@/components/decorator';
import { Button, DatePicker, Input } from 'antd';
import styles from './index.less';
console.log(TestDecorator);

export default function HomePage() {
  const { initialState } = useModel('@@initialState');
  console.log('initialState', initialState);
  const access = useAccess();
  console.log('access', access);
  const intl = useIntl();
  return (
    <div>
      <h2 className={styles.myText}>index page</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
      <div>{intl.formatMessage({ id: 'HELLO' })}</div>
      <FormattedMessage id="World" />
      <Button
        type="primary"
        onClick={() => {
          history.push('/users');
        }}
      >
        Go to /users
      </Button>
      <hr />

      <h2 data-testid="tailwind-header" className={'tailwindCSSHead'}>
        tailwindcss
      </h2>

      <h2> Icons</h2>
      <div>
        <Icon icon="local:rice" />
        <Icon icon="local:logo/umi" />
        <Icon icon="local:logo/foo/smile" />
        <Icon icon="ant-design:fire-twotone" />
      </div>
    </div>
  );
}
