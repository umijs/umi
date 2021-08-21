import styles from './index.less';
import { unstatedModels } from 'umi';
import Example from './Example'

export default function IndexPage() {
  const { global } = unstatedModels.global.useContainer();

  return (
    <div>
      {global}
      <h1 className={styles.title}>Page index</h1>
      <Example/>
    </div>
  );
}
