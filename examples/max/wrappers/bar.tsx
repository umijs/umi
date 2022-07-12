import { Outlet } from 'umi';

export default function Bar() {
  return (
    <div>
      <h2>wrapper bar</h2>
      <Outlet />
    </div>
  );
}
