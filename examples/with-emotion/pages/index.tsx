/* @jsxImportSource @emotion/react */
import { css, jsx } from '@emotion/react';
import { Wrapper, Container, Title, bounce, Animation, Padding } from './style';

const breakpoints = [576, 768, 992, 1200];

const mq = breakpoints.map((bp) => `@media (min-width: ${bp}px)`);

export default function HomePage(props) {
  return (
    <Wrapper>
      <Container column>
        <Title>UmiJS x Emotion</Title>
      </Container>
      <div
        css={css`
          margin-top: 100px;
          padding: 32px;
          background-color: #2eabff;
          font-size: 24px;
          border-radius: 4px;
          &:hover {
            color: white;
          }
        `}
      >
        This is css string example. Hover to change color to white.
      </div>
      <div>
        <div
          css={{
            marginTop: 100,
            color: 'green',
            [mq[0]]: {
              color: 'hotpink',
            },
            [mq[1]]: {
              color: '#2eabff',
            },
          }}
        >
          This is css media example. color default green <br /> {mq[1]} change
          to #2eabff <br /> {mq[0]} change to hotpink
        </div>
      </div>
      <Padding top={100}>
        <Animation name={bounce}>
          This is animation example. bouncing text!
        </Animation>
      </Padding>
    </Wrapper>
  );
}
