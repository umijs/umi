// @ts-ignore
import color from '@umijs/deps/compiled/color';

const ratio = 0.618033988749895;
let hue = Math.random();

export default function (saturation: number = 0.5, value: number = 0.95) {
  hue += ratio;
  hue %= 1;

  return color({
    h: hue * 360,
    s: saturation * 100,
    v: value * 100,
  });
}
