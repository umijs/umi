import { atom, useRecoilState, useSetRecoilState } from 'recoil';

export const counterState = atom({
  key: 'count',
  default: 0,
});
export const useCounterState = () => useRecoilState(counterState);
export const useCounterAction = () => {
  const set = useSetRecoilState(counterState);
  return {
    increment: () => {
      set((state) => state + 1);
    },
    decrement: () => {
      set((state) => state - 1);
    },
  };
};
