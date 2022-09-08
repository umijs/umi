const UsersFoo = (props: any) => {
  console.log(props);
  return (
    <div>
      <h1>Users Foo</h1>
      <div>{props.location}</div>
      <div id="foo">
        <a href="#foo">#foo</a>
      </div>
      <div>1</div>
      <div>1</div>
      <div id="bar">
        <a href="#bar">#bar</a>
      </div>
      <div>1</div>
      <div>1</div>
      <div>1</div>
      <div>1</div>
      <div>1</div>
      <div>1</div>
    </div>
  );
};

export default UsersFoo;
