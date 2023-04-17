import React from 'react';
import { styled } from '{{{importSource}}}';

const Wrapper = styled.div`
  h1 { background: rgb(121, 184, 242); }
`;

export default function Page() {
  return (
    <Wrapper>
      <h1>Page {{{name}}}</h1>
    </Wrapper>
  );
}
