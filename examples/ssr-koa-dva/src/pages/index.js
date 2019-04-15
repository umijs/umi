import { useState } from 'react';
import styles from './index.css';
import { connect } from 'dva';

function Page(props) {
  const [count, setCount] = useState(0);
  return (
    <div className={styles.normal}>
      <div className={styles.welcome} />
      <ul className={styles.list}>
        <li>
          <a className={styles.href} href={(props.page.pageData && props.page.pageData.ssr) || '#'}>
            ssr: {(props.page.pageData && props.page.pageData.ssr) || '#'}
          </a>
        </li>
        <li>
          <a className={styles.href} href={(props.page.pageData && props.page.pageData.csr) || '#'}>
            csr: {(props.page.pageData && props.page.pageData.csr) || '#'}
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
  const store = window.g_app._store;
  if (store) {
    store.dispatch({
      type: 'page/init',
      payload: {
        pageData: {
          ssr: 'http://127.0.0.1:7001',
          csr: 'http://127.0.0.1:8000',
        },
      },
    });
  } else {
    return Promise.resolve({});
  }
};

function mapStateToProps(state) {
  return { page: state.page };
}

export default connect(mapStateToProps)(Page);
