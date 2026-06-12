import styles from './index.less';

export default function Page() {
  return (
    <main className={styles.page}>
      <h1>Utoopack Error Overlay</h1>
      <p>
        Run <code>pnpm trigger:error</code> while dev is running to trigger a
        Less compile error.
      </p>
    </main>
  );
}
