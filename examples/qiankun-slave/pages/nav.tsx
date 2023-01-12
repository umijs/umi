import React from 'react';
import { MicroAppLink } from 'umi';

export default function HomePage() {
  return (
    <MicroAppLink name="slave-app2" to="/hello">
      goto slave app2
    </MicroAppLink>
  );
}
