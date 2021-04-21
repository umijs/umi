import React from 'react';

const fetch = () =>
  Promise.resolve([
    {
      userId: 1,
      title: 'hello',
    },
    {
      userId: 2,
      title: 'world',
    },
  ]);

const Home: React.FC<{ result: any[] }> & {
  getInitialProps: (props: any) => any;
} = (props) => {
  const { result } = props;

  return (
    <div>
      <ul>
        {result.map((item, i) => (
          <li key={item.userId}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
};

Home.getInitialProps = async () => {
  const result = await fetch();
  return {
    result,
  };
};

export default Home;
