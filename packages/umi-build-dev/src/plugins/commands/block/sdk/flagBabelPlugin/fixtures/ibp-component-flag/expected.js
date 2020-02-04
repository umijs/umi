import { UmiUIFlag } from 'umi';
import { Step } from 'antd';

export default function() {
  return (
    <Step>
      <div><GUmiUIFlag filename="/tmp/origin.js" index="l-0" /></div>
      <div><GUmiUIFlag filename="/tmp/origin.js" index="l-1" />foo</div>
      <div><GUmiUIFlag filename="/tmp/origin.js" index="l-2" />bar</div>
      <div><GUmiUIFlag filename="/tmp/origin.js" index="l-3" /></div>
      <div>
        <GUmiUIFlag filename="/tmp/origin.js" index="l-4" inline="true" />
        Hello
        <GUmiUIFlag filename="/tmp/origin.js" index="l-5" inline="true" />
      </div>
    </Step>
  );
}

