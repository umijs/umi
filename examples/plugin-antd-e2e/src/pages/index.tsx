import { DatePicker } from 'antd';
import moment from 'moment';

const fileName = 'favicon';
const imprtedByVariable = import(/* webpackIgnore: true  */ `/${fileName}.png`);
imprtedByVariable.then(console.log, console.log);

const now = moment('2022-01-01');

export default function HomePage() {
  return (
    <div>
      <DatePicker value={now} />
    </div>
  );
}
