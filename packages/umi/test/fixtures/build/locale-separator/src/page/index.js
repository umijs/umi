import {
  formatMessage,
  setLocale,
  getLocale,
  FormattedMessage,
  formatTime,
  formatDate,
} from 'umi-plugin-locale';
import { DatePicker } from 'antd';
import 'antd/lib/date-picker/style';

export default () => {
  console.log(
    'locale-separator',
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
    <div style={{ margin: 16, lineHeight: 2 }}>
      <p id="locale">{getLocale()}</p>
      <button
        style={{ marginRight: 8 }}
        id="btn_en"
        onClick={() => {
          setLocale('en_US');
        }}
      >
        en_US
      </button>
      <button
        id="btn_zh"
        onClick={() => {
          setLocale('zh_CN');
        }}
      >
        zh_CN
      </button>
      <button
        id="btn_sk"
        onClick={() => {
          setLocale('sk');
        }}
      >
        sk
      </button>
      <br />
      <FormattedMessage id="test" values={{ name: 'antd' }} />
      <br />
      <FormattedMessage id="test2" values={{ name: <b>{`<b />`}</b> }} />
      <br />
      {`${formatDate(new Date())} ${formatTime(new Date())}`}
      <br />
      <DatePicker />
    </div>
  );
};
