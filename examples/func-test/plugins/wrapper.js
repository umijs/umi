export default props => {
  return (
    <div>
      <h1>I am Wrapper!</h1>
      {props.children}
    </div>
  );
};
