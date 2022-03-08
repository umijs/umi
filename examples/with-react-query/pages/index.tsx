import React from 'react';
import { useQuery } from 'react-query';
import '../style.less';

export default function HomePage() {
  const { isLoading, data } = useQuery('repoData', () =>
    fetch('https://api.github.com/repos/umijs/umi').then((res) => res.json()),
  );

  return (
    <div className="container">
      <div>
        <p className="title">UmiJS x react-query</p>
        {isLoading && <p>Loading ...</p>}
        {data && <p>UmiJS has {data.stargazers_count} stars now!</p>}
      </div>
    </div>
  );
}
