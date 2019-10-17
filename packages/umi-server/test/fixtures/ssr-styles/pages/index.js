import React from 'react';
import styles from './index.module.less';

const { useState } = React;

const Home = (props) => {
  const [count, setCount] = useState(0);
  const { list = [] } = props;
  const handleClick = () => {
    setCount(count => count + 1);
  }
  return (
    <div className={styles.wrapper}>
      <h1>Hello UmiJS SSR Styles</h1>
      {Array.isArray(list) && list.length > 0 &&
        <ul>
          {list.map((item, i) => (
            <li key={i.toString()}>{item.name}</li>
          ))}
        </ul>
      }
      <button onClick={handleClick}>{count}</button>
    </div>
  )
}

Home.getInitialProps = async ({ route, isServer }) => {
  return Promise.resolve({
    list: [
      { name: 'Alice' },
      { name: 'Jack' },
      { name: 'Tony' }
    ],
  })
}

export default Home;
