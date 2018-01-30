export default function(props) {
  return (
    <div>
      <header>Header</header>
      {props.children}
      <footer>Footer</footer>
    </div>
  );
}
