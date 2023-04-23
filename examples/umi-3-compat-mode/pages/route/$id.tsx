export default (props) => {
  console.log('props.routes', props.routes);
  return (
    <div>
      <h2>route test</h2>
      <div>
        <h3>props.location</h3> <pre>{JSON.stringify(props.location)}</pre>
      </div>
      <div>
        <h3>props.route</h3> <pre>{JSON.stringify(props.route)}</pre>
      </div>
      <div>
        <h3>props.routes</h3> <pre>checkout console</pre>
      </div>
      <div>
        <h3>props.match</h3> <pre>{JSON.stringify(props.match)}</pre>
      </div>
      <div>
        <h3>props.params</h3> <pre>{JSON.stringify(props.params)}</pre>
      </div>
    </div>
  );
};
