import React from 'react';
import styled from 'styled-components';
import ReactDOM from 'react-dom';

const Bubble = styled('div')`
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
`;

const App = () => {
  const [aa, setAA] = React.useState(0);
  console.log('aaaaaa', aa);
  return (
    <Bubble>
      <button onClick={() => setAA(aa + 1)}>Click {aa}</button>
    </Bubble>
  );
};

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

ReactDOM.render(<App />, node);
