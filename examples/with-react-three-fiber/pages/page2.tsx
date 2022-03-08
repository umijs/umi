import { Canvas, extend } from '@react-three/fiber';
import React from 'react';
// @ts-ignore
import { Text } from 'troika-three-text';
import LinkBox from '../components/LinkBox';

extend({ Text });

export default function Page1() {
  return (
    <Canvas style={{ width: '100%', height: '100vh' }}>
      <text
        position-x={0}
        position-y={1}
        position-z={0}
        fontSize={0.2}
        color="#000000"
        // @ts-ignore
        text="Page 2"
        anchorX="center"
        anchorY="middle"
      >
        <meshPhongMaterial attach="material" color="#000000" />
      </text>
      <LinkBox position={[0, -1, 0]} href="/page1" text="Go back" />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
    </Canvas>
  );
}
