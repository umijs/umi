/**
 * title: Home
 */
import styles from './index.css';

function Page(props) {
  return (
    <div className={styles.normal}>
      <h2>Page index</h2>
      <h3>{props.data && props.data.csr}</h3>
    </div>
  );
}

Page.getInitialProps = async () => {
  console.log('Home getInitialProps');
  return Promise.resolve({
    data: {
      ssr: 'http://127.0.0.1:7001',
      csr: 'http://127.0.0.1:8000',
    },
  });
};

export default Page;
