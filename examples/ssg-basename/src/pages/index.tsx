import React, { useState } from 'react';
import { Link } from 'umi';

const Home = () => {
  const [num, setNum] = useState(0);
  return (
    <div>
      <div>
        <strong>HOME</strong> page
        <button
          style={{ marginLeft: '5px' }}
          onClick={() => setNum((val) => val + 1)}
        >
          couts: {num}
        </button>
      </div>

      <br />
      <Link to="/about">to about</Link>
    </div>
  );
};

export default Home;
