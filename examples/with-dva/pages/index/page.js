import Link from 'umi/link';
import dva from 'dva';
import Count from './components/Count';
import styles from './page.css';

const app = dva();
app.model(require('./models/count').default);

app.router(() => {
  return (
    <div className={styles.normal}>
      <h2>Index Page</h2>
      <Count />
      <br />
      <div>
        <Link to="/list">Go to list.html</Link>
      </div>
    </div>
  );
});

export default app.start();
