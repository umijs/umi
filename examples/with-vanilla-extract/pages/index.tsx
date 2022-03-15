import * as styles from './index.css';

export default function HomePage(props) {
  return (
    <div className={styles.center}>
      <p className={styles.title}>UmiJS x vanilla-extract</p>
      <div className={styles.hoverText}>
        This is css string example. Hover to change color to white.
      </div>

      <div className={styles.mediaText}>
        This is css media example. color default green <br /> {styles.medias[1]}{' '}
        change to #2eabff <br /> {styles.medias[0]} change to hotpink
      </div>
      <div>
        <div className={styles.bounceText}>
          This is animation example. bouncing text!
        </div>
      </div>
    </div>
  );
}
