import { connect } from 'dva';
import router from 'umi/router';
import styles from './page.css';

function App(props) {
  return (
    <div className={styles.normal}>
      <h2>{props.text}</h2>
      <div
        onClick={() => {
          router.goBack();
        }}
      >
        Back
      </div>
    </div>
  );
}

export default connect(state => {
  return {
    text: state.global.text,
  };
})(App);
