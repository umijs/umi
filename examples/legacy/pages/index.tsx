import JSZip from 'jszip';
import { useEffect } from 'react';
import { ReactComponent as Simle } from '../smile.svg';

console.log('jszip', JSZip);
const zip = new JSZip();

zip;

export default function Page() {
  useEffect(() => {
    const func = async () => {
      // @ts-ignore
      const _ = await import('lodash');
      console.log(Object.keys(_.default.omit({ a: 1 }, 'a')).length === 0);
    };
    func();
  }, []);

  return (
    <div>
      legacy: <Simle />
    </div>
  );
}
