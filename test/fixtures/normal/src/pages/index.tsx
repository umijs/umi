import React from 'react';
// @ts-ignore
import styles from './index.less';

export default () => {
  return (
    <div className={styles.container}>
      <div className={styles.leftContainer}>
        <h2>Welcome to Remix!</h2>
        <p className={styles.p}>We're stoked that you're here. 🥳</p>
        <p className={styles.p}>
          Feel free to take a look around the code to see how Remix does things,
          it might be a bit different than what you’re used to. When you're
          ready to dive deeper, we've got plenty of resources to get you
          up-and-running quickly.
        </p>
        <p className={styles.p}>
          Check out all the demos in this starter, and then just delete the
          app/routes/demos and app/styles/demos folders when you're ready to
          turn this into your next project.
        </p>
      </div>
      <div className={styles.rightContainer}>
        <h2 id="demoApp"> Demos In This App </h2>
        <ul>
          <li>Actions</li>
          <li>Nested Routes</li>
          <li>URL Params</li>
        </ul>
      </div>
    </div>
  );
};
