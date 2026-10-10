import { Link } from '@umijs/max';
import React, { useState } from 'react';

export default function AboutPage() {
  const [note, setNote] = useState('');

  return (
    <div style={{ padding: 8 }}>
      <h3>App1 /about</h3>
      <p>
        <Link to="/">← back to home</Link>
      </p>
      <label>
        Note (should keep when switching pages)
        <input
          style={{
            display: 'block',
            width: '100%',
            maxWidth: 320,
            marginTop: 4,
          }}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>
    </div>
  );
}
