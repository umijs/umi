import { Canvas, extend } from '@react-three/fiber';
import React from 'react';
// @ts-ignore
import { Text } from 'troika-three-text';
import LinkBox from '../components/LinkBox';
import Title from '../components/Title';

extend({ Text });

export default function HomePage() {
  return (
    <Canvas style={{ width: '100%', height: '100vh' }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Title />
      <LinkBox position={[0, -1, 0]} href="page1" text="Go to Page 1" />
    </Canvas>
  );
}
