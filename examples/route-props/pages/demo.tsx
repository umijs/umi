import { share } from '@/props';
import { HomeOutlined } from '@ant-design/icons';

export default function Page() {
  return <div>Demo Page</div>;
}

export const routeProps = {
  ...share,
  name: 'DemoMenuName',
  icon: <HomeOutlined />,
};
