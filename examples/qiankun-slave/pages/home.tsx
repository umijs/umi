import React from 'react';
import { MicroAppLink } from 'umi';

export default function HomePage() {
  return (
    <div>
      Slave Home Page{' '}
      <MicroAppLink name="slave-app2" to="hello">
        goto slave-app2
      </MicroAppLink>
    </div>
  );
}
