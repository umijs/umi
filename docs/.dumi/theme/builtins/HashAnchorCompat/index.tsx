import { useLayoutEffect } from 'react';

interface IHashAnchorCompatProps {
  from: string;
  to: string;
}

export default function HashAnchorCompat({ from, to }: IHashAnchorCompatProps) {
  useLayoutEffect(() => {
    const hash = window.location.hash;
    if (hash === from) {
      window.location.hash = to;
    }
  }, []);

  return null;
}
