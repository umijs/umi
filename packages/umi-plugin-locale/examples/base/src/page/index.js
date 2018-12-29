import {
  formatMessage,
  setLocale,
  getLocale,
  FormattedMessage,
} from 'umi/locale';
import { DatePicker } from 'antd';

export default () => {
  console.log(
    getLocale(),
    formatMessage(
      {
        id: 'test',
      },
      {
        name: 'antd',
      },
    ),
  );
  return (
    <div>
      hello world.
      <FormattedMessage id="test" values={{ name: 'antd' }} />
      <br />
      <FormattedMessage id="test2" values={{ name: 'test2' }} />
      <DatePicker />
      <button
        onClick={() => {
          setLocale('en-US');
        }}
      >
        en-US
      </button>
      <button
        onClick={() => {
          setLocale('zh-CN');
        }}
      >
        zh-CN
      </button>
    </div>
  );
};
