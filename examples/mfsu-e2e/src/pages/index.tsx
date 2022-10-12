import { format } from '../utils/format';

const fileName = 'favicon';
const imprtedByVariable = import(/* webpackIgnore: true  */ `/${fileName}.png`);
imprtedByVariable.then(console.log, console.log);

export default function HomePage() {
  return (
    <div>
      <h2>{format('MFSU is working')}</h2>
    </div>
  );
}
