export default function HomePage() {
  const a = "a";
  const b = "b";
  return <pre>{JSON.stringify(require(`./dal/${a}`), null, 2)}</pre>;
}
