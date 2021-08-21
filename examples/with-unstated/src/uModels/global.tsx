import { useState } from 'react';

export default function useGlobal() {
  const [global] = useState('global');

  return {
    global,
  };
}
