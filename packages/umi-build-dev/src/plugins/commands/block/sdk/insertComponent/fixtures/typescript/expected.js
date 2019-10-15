import Demo1 from './Demo1';
import Foo from './Foo';
interface TestPageProps {
  className?: string;
}
export default (props: TestPageProps) => {
  return (
    <React.Fragment>
      <Foo />
      <Demo />
    </React.Fragment>
  );
};
