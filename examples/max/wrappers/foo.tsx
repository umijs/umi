import { Outlet } from 'umi';

export default function Foo() {
  return (
    <div>
      <h2>wrapper foo</h2>
      <Outlet />
    </div>
  );
}
