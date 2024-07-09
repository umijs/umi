import React from 'react';
// @ts-expect-error 233
import styles from './index.less';

export default (props: { init?: number }) => {
  const [c, setC] = React.useState(props.init ?? 10);

  return (
    <div className={styles.bg}>
      <h1> remote Counter</h1>
      <div>
        <button
          data-testid="remote-button"
          onClick={() => {
            setC((c) => c + 1);
          }}
        >
          click to add
        </button>
      </div>
      <div>
        remote hooks counter
        <span data-testid="remote-counter">{c}</span>
      </div>
    </div>
  );
};
