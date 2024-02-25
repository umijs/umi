import { Link } from 'umi';

const Home = () => {
  return (
    <div>
      <div>
        <strong>home</strong> page
      </div>
      <br />
      <Link to="/about">to about</Link>
    </div>
  );
};

export default Home;
