import React from 'react';

const { useState } = React;

const Home = (props) => {
  const [count, setCount] = useState(0);
  const { list = [], location: { search } } = props;

  const handleClick = () => {
    setCount(count => count + 1);
  }
  return (
    <div className="wrapper">
      <h1>Hello UmiJS SSR</h1>
      {search && <p>searchPath: {search}</p>}
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
