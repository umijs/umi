import React, { useRef, useState, useEffect } from 'react';
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks';
import styles from './index.less';

export default props => {
  const { logs } = props;
  const [minimized, setMinimized] = useState(false);
  const containerEl = useRef(null);

  const { xterm } = window;

  webLinks.webLinksInit(xterm, handleLink);

  useEffect(
    () => {
      initXTerm();
      xterm.on('key', (key, ev) => {
        if (key.charCodeAt(0) == 13) {
          xterm.write('\n');
        }
        xterm.write(key);
      });
    },
    [minimized],
  );

  function initXTerm() {
    xterm.open(containerEl.current);
    xterm.write(logs);
  }

  function handleLink(e, uri) {
    window.open(uri, '_blank');
  }

  function fit() {
    xterm.element.style.display = 'none';
    setTimeout(() => {
      xterm.fit();
      xterm.element.style.display = '';
      xterm.refresh(0, xterm.rows - 1);
    });
  }

  function minimize() {
    setMinimized(true);
  }

  function maximize() {
    setMinimized(false);
  }

  return (
    <div className={`${styles.normal} ${minimized ? styles.minimize : ''}`}>
      {/* <div className={styles.header}> */}
      {/*  Terminal */}
      {/*  <button onClick={fit}>fit</button> */}
      {/*  <button onClick={minimize}>minimize</button> */}
      {/*  <button onClick={maximize}>maximize</button> */}
      {/* </div> */}
      <div className={styles.main} ref={containerEl} />
    </div>
  );
};
