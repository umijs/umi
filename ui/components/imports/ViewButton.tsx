import { FC } from 'react';
import { Icon, styled } from 'umi';

interface IProps {
  options: { icon: string; value: string }[];
  onChange: (v: string) => void;
  value: string;
}

const Wrapper = styled.div`
  display: inline-block;

  .view {
    display: inline-block;
    border: 1px solid var(--text-color);
    padding: 0.25rem 0.75rem;
    position: relative;
    cursor: pointer;

    &.active {
      cursor: unset;
      z-index: 10;
      color: var(--highlight-color);
      border-color: var(--highlight-color);
    }

    &:first-child {
      border-bottom-left-radius: 4px;
      border-top-left-radius: 4px;
    }

    &:last-child {
      left: -1px;
      border-bottom-right-radius: 4px;
      border-top-right-radius: 4px;
    }
  }
`;

export const ViewButton: FC<IProps> = ({ value, options = [], onChange }) => {
  return (
    <Wrapper>
      {options.map((opt) => {
        return (
          <span
            key={opt.value}
            className={value === opt.value ? 'view active' : 'view'}
            onClick={() => onChange(opt.value)}
          >
            <Icon width="24" height="24" icon={`ant-design:${opt.icon}`} />
          </span>
        );
      })}
    </Wrapper>
  );
};
