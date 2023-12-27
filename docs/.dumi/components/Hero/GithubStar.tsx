import React, { useEffect, useState } from 'react';
import CountUp from 'react-countup';

const LS_KEY = 'github-stars';

export const GithubStar = () => {
  const [count, setCount] = useState(
    (typeof window !== 'undefined' && localStorage.getItem(LS_KEY)) || '14K+',
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://api.github.com/repos/umijs/umi');
        const count = (await res.json()).stargazers_count;
        if (count) {
          setCount(count);
          localStorage.setItem(LS_KEY, count);
        }
      } catch (e) {
        setCount('0');
        localStorage.setItem(LS_KEY, '0');
      }
    })();
  }, []);

  return (
    <span>
      <CountUp end={+count} /> Github Stars
    </span>
  );
};
