import router from 'umi/router';
import styles from './list.css';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>List Page</h1>
      <button
        onClick={() => {
          router.goBack();
        }}
      >
        返回
      </button>
    </div>
  );
}
