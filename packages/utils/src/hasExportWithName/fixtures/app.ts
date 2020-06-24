import { useRef } from 'react';

export const name1 = {};
export function name2() {};
const name3 = {};
export { name3 };
// export const name4 = '';
export interface name4 {};
export let name5 = '';
// 干扰
type abc<T> = (...args: T[]) => void;
