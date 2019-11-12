const App = props => {
  const [data, setData] = React.useState(props.data || '');
  useEffect(() => {
    (async () => {
      const res = await request('/api/data');
      setData(res.data);
    })();
  }, []);
  return <div>Hello UmiJS SSR {data}</div>;
};

App.getInitialProps = async () => {
  const data = await request('/api/data');
  return {
    data,
  };
};
