import React from 'react';

function Title() {
  return (
    <text
      position-z={0}
      position-x={0}
      position-y={1}
      fontSize={0.5}
      color="#000000"
      // @ts-ignore
      text="UmiJS x react-three-fiber"
      anchorX="center"
      anchorY="middle"
    >
      <meshPhongMaterial attach="material" color="#000000" />
    </text>
  );
}

export default Title;
