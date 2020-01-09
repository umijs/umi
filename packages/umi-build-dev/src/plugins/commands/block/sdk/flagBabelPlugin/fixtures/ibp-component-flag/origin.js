import { UmiUIFlag } from 'umi';
import { Step } from 'antd';

export default function() {
  return (
    <Step>
      <div><UmiUIFlag /></div>
      <div><UmiUIFlag />foo</div>
      <div><UmiUIFlag />bar</div>
      <div><UmiUIFlag /></div>
      <div>
        <UmiUIFlag inline />
        Hello
        <UmiUIFlag inline />
      </div>
    </Step>
  );
}
