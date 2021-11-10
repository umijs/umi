import React from 'react';
import ReactDOM from 'react-dom';

function App() {
  return <div>ESM App</div>;
}

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
