import React from 'react';
import { unstatedModels } from 'umi';

const ChildComponent: React.FC = () => {
  const { exampleState } = unstatedModels.example.useContainer()
  return (
    <div>child: {exampleState}</div>
  )
}

const Example: React.FC = () => {
  const { exampleState } = unstatedModels.example.useContainer()
  return (
    <div>
      parent: {exampleState}
      <ChildComponent/>
    </div>
  )
}

export default () => unstatedModels.example.wrapProvider(<Example/>);
