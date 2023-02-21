import { state as globalState } from '@/models/global';
import { Link, styled, useSnapshot } from 'umi';

const Wrapper = styled.div``;

export function Menu() {
  const { menus } = useSnapshot(globalState);
  return (
    <Wrapper>
      {menus.map((menu) => (
        <div key={menu.name}>
          <Link to={menu.path}>{menu.name}</Link>
        </div>
      ))}
    </Wrapper>
  );
}
