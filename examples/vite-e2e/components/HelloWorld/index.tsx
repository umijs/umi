const HelloWorld = ({ msg }: { msg: string }) => {
  return (
    <div>
      <h4 data-testid="hello">Hello {msg}</h4>
    </div>
  );
};

export default HelloWorld;
