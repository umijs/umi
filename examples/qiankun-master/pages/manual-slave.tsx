import React, { useRef, useEffect } from 'react';
import { loadMicroApp } from 'qiankun';
export default function ManualSlavePage() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(loadMicroApp);

    const app = loadMicroApp({
      name: 'slave',
      container: divRef.current!,
      entry: 'http://127.0.0.1:5555',
    });

    app?.update?.({});

    console.log(app);

    return () => {
      app.unmount();
    };
  }, []);

  return <div ref={divRef}></div>;
}
