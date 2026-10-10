import { Link } from '@umijs/max';
import React, { useState } from 'react';

export default function App2Page() {
  const [text, setText] = useState('');
  const [color, setColor] = useState('red');

  return (
    <div style={{ padding: 8 }}>
      <h3>App2 — keepAlive demo</h3>
      <p>
        Type / select, switch to App1 or <Link to="/about">/about</Link>, then
        come back to verify cache.
      </p>
      <div style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <label>
          Input
          <input
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            value={text}
            placeholder="type something…"
            onChange={(e) => setText(e.target.value)}
          />
        </label>
        <label>
          Select
          <select
            style={{ display: 'block', width: '100%', marginTop: 4 }}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </select>
        </label>
      </div>
      <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 8 }}>
        {JSON.stringify({ text, color }, null, 2)}
      </pre>
    </div>
  );
}
