//@ts-ignore
import React, { useState, useTransition } from 'react';
//@ts-ignore
import styles from './index.less';

export default function IndexPage() {
  const [isPending, startTransition] = useTransition();
  const [state, setstate] = useState(0);
  return (
    <div>
      {isPending && <div>loading...</div>}
      <h1
        className={styles.title}
        onClick={() => {
          startTransition(() => {
            setstate(1);
          });
        }}
      >
        Click Me!
      </h1>
      {state}
    </div>
  );
}
