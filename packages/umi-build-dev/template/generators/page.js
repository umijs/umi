import styles from './<%= name %>.css';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>Page <%= name %></h1>
    </div>
  );
}
