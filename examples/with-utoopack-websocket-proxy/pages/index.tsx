import { useEffect, useState } from 'react';

export default function HomePage() {
  const [status, setStatus] = useState('connecting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${location.host}/ws`);

    socket.onopen = () => setStatus('connected');
    socket.onmessage = (event) => setMessage(String(event.data));
    socket.onerror = () => setStatus('error');
    socket.onclose = () => setStatus('closed');

    return () => socket.close();
  }, []);

  return (
    <main>
      <h1>Utoopack WebSocket proxy</h1>
      <p>
        Status: <strong data-testid="status">{status}</strong>
      </p>
      <p>
        Backend message: <strong>{message || 'waiting'}</strong>
      </p>
    </main>
  );
}
