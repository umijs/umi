/**
 * 等待一段时间
 * @param time 等待时间
 * @returns
 */
export const waitTime = (time: number) => {
  return new Promise((res) => {
    setTimeout(res, time);
  });
};
