import { DatePicker, version } from 'antd';
import moment from 'moment';

const fileName = 'favicon';
const imprtedByVariable = import(/* webpackIgnore: true  */ `/${fileName}.png`);
imprtedByVariable.then(console.log, console.log);

const now = moment('2022-01-01') as any;

export default function HomePage() {
  return (
    <div>
      <h1>{version}</h1>
      <DatePicker
        allowClear
        defaultValue={now}
        onChange={(val) => {
          console.log(val);
        }}
      />
    </div>
  );
}
