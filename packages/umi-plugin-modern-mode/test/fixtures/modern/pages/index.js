import styles from './index.css';
import { b, add } from './util';

export default function() {
  b().then((x) => {
    console.log(x);
  });
  const numbers = [4, 38];
  console.log(add(...numbers));
  return (
    <div className={styles.normal}>
      <h1>Page index</h1>
    </div>
  );
}
