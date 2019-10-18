import * as React from 'react';

const News = (props) => {
  const { id, name } = props || {};

  return (
    <div className="newsWrapper">
      <p>{id}_{name}</p>
    </div>

  );
};

News.getInitialProps = async ({ route, store, isServer }) => {
  const { id } = route.params;
  const data = [{
    id: 0,
    name: 'zero',
  }, {
    id: 1,
    name: 'hello',
  }, {
    id: 2,
    name: 'world',
  }];
  return Promise.resolve(data[id] || data[0]);
};

export default News;
