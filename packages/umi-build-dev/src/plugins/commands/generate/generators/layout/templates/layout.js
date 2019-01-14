import styles from './<%= name %>.css';

export default function(props) {
  return (
    <div className={styles.normal}>
      <h1><%= title %></h1>
      {
        props.children
      }
    </div>
  );
}
