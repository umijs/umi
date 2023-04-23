import React, { useEffect, useState } from 'react';

export default function HomePage() {
  const [res, setRes] = useState();
  useEffect(() => {
    fetch('/api/todos/1')
      .then((response) => response.json())
      .then((json) => setRes(json));
  }, []);
  return (
    <div className="container">
      <h1>Proxy res</h1>
      {JSON.stringify(res)}
    </div>
  );
}
