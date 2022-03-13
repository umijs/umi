import styled from 'styled-components';
import {
  Wrapper,
  Container,
  Title,
  BounceText,
  Padding,
  HoverText,
  MediaText,
  medias,
} from './style';

export default function HomePage(props) {
  return (
    <Wrapper>
      <Container column>
        <Title>UmiJS x Styled-components</Title>
      </Container>
      <HoverText>
        This is css string example. Hover to change color to white.
      </HoverText>
      <MediaText>
        This is css media example. color default green <br /> {medias[1]} change
        to #2eabff <br /> {medias[0]} change to hotpink
      </MediaText>
      <Padding top={100}>
        <BounceText>This is animation example. bouncing text!</BounceText>
      </Padding>
    </Wrapper>
  );
}
