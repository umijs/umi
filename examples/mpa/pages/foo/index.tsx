import React, { useState } from 'react';

export default () => {
  // for testing hooks in mpa with mfsu
  const [name] = useState('Foo');
  return <div>Hello {name}</div>;
};
export const config = {
  title: 'fooooooo',
  layout: '@/layouts/foo',
};
