import React, { useEffect } from 'react';
// @ts-ignore
import worker from 'workerize-loader!./worker';

export default function Page() {
  useEffect(() => {
    let instance = worker(); // `new` is optional
    instance.expensive(1000).then((count) => {
      console.log(`Ran ${count} loops`);
    });
  }, []);
  return (
    <div>
      <h1>with web worker</h1>
    </div>
  );
}
