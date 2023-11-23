import { css, styled } from 'umi';

const Style = styled.div`
  ${css`
    font-size: 18px;
  `};
`;

export default function Page() {
  return (
    <Style
      data-color="green"
      css={`
        background: papayawhip;
        color: ${(props: any) => props['data-color']};
      `}
    >
      css style
    </Style>
  );
}
