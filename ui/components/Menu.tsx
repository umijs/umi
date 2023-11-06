import { useAppData } from '@/hooks/useAppData';
import { state as globalState } from '@/models/global';
import { Icon, NavLink, styled, useSnapshot } from 'umi';

const Wrapper = styled.div`
  & > div {
    padding: 0.25rem;

    a {
      display: flex;
      align-items: center;
      padding: 0.5rem 1.25rem;
      border-radius: 5px;
      // border-bottom: 1px solid var(--subtle-color);

      span {
        margin-right: 0.5rem;
      }
    }
    a:hover {
      background: var(--bg-hover-color);
    }
    a.active {
      background: var(--bg-active-color);
      color: var(--bg-active-text-color);
    }
  }
`;

export function Menu() {
  const { modules = [] } = useAppData()?.data?.ui || {};
  const { menus } = useSnapshot(globalState);
  const uiMenusAdded = modules.map((module) => module.menus || []).flat();

  return (
    <Wrapper>
      {menus.concat(uiMenusAdded).map((menu) => (
        <div key={menu.name}>
          <NavLink
            to={menu.path}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon icon={`ant-design:${menu.icon}`} />
            {menu.name}
          </NavLink>
        </div>
      ))}
    </Wrapper>
  );
}
