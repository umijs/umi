import React, { useEffect, useState } from 'react';

const LS_KEY = 'github-stars';

export default () => {
  const [count, setCount] = useState(localStorage.getItem(LS_KEY) || '12K+');

  useEffect(() => {
    (async () => {
      const res = await fetch('https://api.github.com/repos/umijs/umi');
      const count = (await res.json()).stargazers_count;
      if (count) {
        setCount(count);
        localStorage.setItem(LS_KEY, count);
      }
    })();
  }, []);

  return <span>{count} Github Stars</span>;
};
