import Deploy from '../images/deploy.svg';
import { ReactComponent as EmptyState } from '../images/emptyState.svg';
import styles from './index.less';

console.log('Deploy', Deploy);
export default function Page() {
  return (
    <div className={styles.backgroundImg}>
      <EmptyState />
    </div>
  );
}
