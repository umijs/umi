import Demo1 from './Demo1';
interface TestPageProps {
  className?: string;
}
export default (props: TestPageProps) => {
  return (
    <React.Fragment>
      <Demo />
    </React.Fragment>
  );
}
