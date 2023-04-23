import type { MouseEventHandler } from 'react';

export default function Greet({
  name,
  onClick,
}: {
  name?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) {
  return <div onClick={onClick}>Hello {name}</div>;
}
