import React, { useState } from 'react';
import { Link } from 'umi';

const About = () => {
  const [num, setNum] = useState(0);

  return (
    <div>
      <div>
        <strong>ABOUT</strong> page
        <button
          style={{ marginLeft: '5px' }}
          onClick={() => setNum((val) => val + 1)}
        >
          couts: {num}
        </button>
      </div>
      <br />
      <Link to="/">to home</Link>
    </div>
  );
};

export default About;
