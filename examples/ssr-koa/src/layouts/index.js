import styles from './index.css';
import serialize from 'serialize-javascript';

function BasicLayout(props) {
  if (window.__isBrowser__) {
    return (
      <div className={styles.normal}>
        <h1 className={styles.title}>Yay! Welcome to umi!</h1>
        {props.children}
      </div>
    );
  } else {
    return (
      <html>
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui"
          />
          <title>ssr-dynamic-egg</title>
          <link rel="stylesheet" href="./umi.css" />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.routeBase="/"`,
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__useSSR__=true;window.__initialData__=${serialize({
                data: props.data,
              })}`,
            }}
          />
        </head>
        <body>
          <div id="root">
            <div className={styles.normal}>
              <h1 className={styles.title}>Yay! Welcome to umi!</h1>
              {props.children}
            </div>
          </div>
        </body>
        <script src="./umi.js" />
      </html>
    );
  }
}

export default BasicLayout;
