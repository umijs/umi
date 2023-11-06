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

const includedIcons = [
  'local:rice',
  'local:logo/umi',
  'ant-design:fire-twotone',
];

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
      {/* 中英文语言切换 */}
      <section id="locales">
        <div className="hello">{intl.formatMessage({ id: 'HELLO' })}</div>
        <FormattedMessage id="World" />
        <div className="user-welcome">
          {intl.formatMessage({ id: 'user.welcome' })}
        </div>
      </section>
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
        {includedIcons.map((i) => {
          return <Icon spin icon={i} className={i} key={i} />;
        })}
        <Icon icon="local:logo/foo/smile" />
        <Icon icon="local:logo/heart-Upper-CASE" />
      </div>
    </div>
  );
}
