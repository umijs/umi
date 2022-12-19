import { useState } from 'react';
import foo from 'foo-module';
import { format } from '../utils/format';

const fileName = 'favicon';
const imprtedByVariable = import(/* webpackIgnore: true  */ `/${fileName}.png`);
imprtedByVariable.then(console.log, console.log);

export default function HomePage() {
  const [greeting] = useState('MFSU is working');

  return (
    <div>
      <h2>{format(greeting)}</h2>
      <div>{foo}</div>
    </div>
  );
}
