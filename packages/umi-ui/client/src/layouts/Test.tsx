import React, { useState, useEffect } from 'react';
import { callRemote, listenRemote } from '@/socket';

export default () => {
  const [npmClients, setNpmClients] = useState([]);

  useEffect(() => {
    (async () => {
      const { data: npmClients } = await callRemote({ type: '@@project/getNpmClients' });
      setNpmClients(npmClients);
    })();
  }, []);

  return (
    <div>
      <h1>Test</h1>
      <h2>Npm Clients</h2>
      <ul>
        {npmClients.map(n => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  );
};
