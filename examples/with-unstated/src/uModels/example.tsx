import { useState } from 'react';

export default function useExample() {
  const [exampleState] = useState('exampleState');

  return {
    exampleState
  };
}
