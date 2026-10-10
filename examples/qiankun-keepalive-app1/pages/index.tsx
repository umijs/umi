import { Link } from '@umijs/max';
import React, { useState } from 'react';

export default function App1Page() {
  const [text, setText] = useState('');
  const [fruit, setFruit] = useState('apple');

  return (
    <div style={{ padding: 8 }}>
      <h3>App1 — keepAlive demo</h3>
      <p>
        Type / select, switch to App2 or <Link to="/about">/about</Link>, then
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
            value={fruit}
            onChange={(e) => setFruit(e.target.value)}
          >
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
            <option value="orange">Orange</option>
          </select>
        </label>
      </div>
      <pre style={{ marginTop: 16, background: '#f5f5f5', padding: 8 }}>
        {JSON.stringify({ text, fruit }, null, 2)}
      </pre>
    </div>
  );
}
