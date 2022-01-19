import { useFrame } from '@react-three/fiber';
import React, { Fragment, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { history } from 'umi';

interface Props {
  position: [number, number, number];
  href: string;
  text: string;
}

function LinkBox(props: Props) {
  const ref = useRef<THREE.Mesh>();

  const [hovered, hover] = useState(false);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += 0.01;
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <Fragment>
      <text
        fontSize={0.2}
        // @ts-ignore
        position={[
          props.position[0],
          props.position[1] + 0.6,
          props.position[2],
        ]}
        color="#000000"
        text={props.text}
        anchorX="center"
        anchorY="middle"
      >
        <meshPhongMaterial attach="material" color="#000000" />
      </text>
      <mesh
        position={props.position}
        ref={ref}
        scale={0.5}
        onClick={() => history.push(props.href)}
        onPointerOver={() => hover(true)}
        onPointerOut={() => hover(false)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
    </Fragment>
  );
}

export default LinkBox;
