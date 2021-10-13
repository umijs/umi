import React from 'react';
import { Navigator } from 'react-router-dom';

export function App(props: { navigator: Navigator; routes: any[] }) {
  console.log('app props', props);
  return <div>app</div>;
}
