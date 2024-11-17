import { useState } from 'react';

export default function HomePage() {
  const [count] = useState(0);
  return <div>React: {count}</div>;
}
