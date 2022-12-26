import React from 'react';
import { MicroAppLink } from 'umi';

export default function HomePage() {
  return (
    <div>
      Slave Home Page{' '}
      <MicroAppLink appName="slave-app2" appRoute="/hello">
        goto slave-app2
      </MicroAppLink>
    </div>
  );
}
