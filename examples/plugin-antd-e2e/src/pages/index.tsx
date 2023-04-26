import { DatePicker, message, version } from 'antd';
import moment from 'moment';
import React from 'react';

const fileName = 'favicon';
const imprtedByVariable = import(/* webpackIgnore: true  */ `/${fileName}.png`);
imprtedByVariable.then(console.log, console.log);

const now = moment('2022-01-01') as any;

export default function HomePage() {
  React.useEffect(() => {
    message.success('Hello World!', 0);
  }, []);

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
