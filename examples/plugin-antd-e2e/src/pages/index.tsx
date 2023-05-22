import { Button, DatePicker, Modal, Tag, version } from 'antd';
import moment from 'moment';
import './index.less';

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
      <Button
        type="primary"
        onClick={() => {
          Modal.confirm({
            title: 'Confirm',
            content: 'Bla bla ...',
          });
        }}
      >
        Confirm Me
      </Button>
      <Tag className="my-tag">Tag</Tag>
    </div>
  );
}
