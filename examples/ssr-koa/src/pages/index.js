import { useState } from 'react';
import styles from './index.css';

function Page(props) {
  const [count, setCount] = useState(0);
  return (
    <div className={styles.normal}>
      <div className={styles.welcome} />
      <ul className={styles.list}>
        <li>
          <a className={styles.href} href={(props.data && props.data.ssr) || '#'}>
            ssr: {(props.data && props.data.ssr) || '#'}
          </a>
        </li>
        <li>
          <a className={styles.href} href={(props.data && props.data.csr) || '#'}>
            csr: {(props.data && props.data.csr) || '#'}
          </a>
        </li>
        <div>{count}</div>
        <button
          onClick={() => {
            setCount(count + 1);
          }}
        >
          count++
        </button>
      </ul>
    </div>
  );
}

Page.getInitialProps = async () => {
  return Promise.resolve({
    data: {
      ssr: 'http://127.0.0.1:7001',
      csr: 'http://127.0.0.1:8000',
    },
  });
};

export default Page;
