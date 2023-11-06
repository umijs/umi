import { actions, state as globalState } from '@/models/global';
import { Icon, styled, useSnapshot } from 'umi';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  // border-bottom: 1px solid var(--subtle-color);

  .logo-left {
    display: flex;
    span {
      color: var(--accent-color);
      margin-right: 0.5rem;
      font-weight: bold;
      font-size: 1.125rem;
    }
  }

  .mode-icon {
    color: var(--second-text-color);
    margin-left: 1rem;
    cursor: pointer;
  }
`;

export function Logo() {
  const state = useSnapshot(globalState);

  const changeMode = () => {
    actions.toggleMode();
  };
  const renderModeIcon = () => {
    const iconName = state.mode === 'light' ? 'local:sun' : 'local:moon';

    return (
      <Icon
        className="mode-icon"
        icon={iconName}
        width="20"
        height="20"
        onClick={changeMode}
      />
    );
  };

  return (
    <Wrapper>
      <div className="logo-left">
        <Icon icon="local:umi" />
        <span>Umi UI</span>
      </div>
      {renderModeIcon()}
    </Wrapper>
  );
}
