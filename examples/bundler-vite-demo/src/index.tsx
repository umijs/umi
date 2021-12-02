import React from 'react';
import ReactDOM from 'react-dom';
import logoSrc, { ReactComponent as LogoComponent } from './logo.svg';

function App() {
  return (
    <div>
      <LogoComponent style={{ fontSize: 100 }} />
      <br />
      <LogoComponent width={50} height={50} />
      <br />
      <img src={logoSrc} alt="logo" />
    </div>
  );
}

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
