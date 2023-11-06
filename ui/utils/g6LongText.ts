import G6 from '@antv/g6';

// G6换行符处理超长文本
export const superLongTextHandle = (
  str: string,
  maxWidth: number,
  fontSize: number,
) => {
  let currentWidth = 0;
  let res = str;
  // 区分汉字和字母
  const pattern = new RegExp('[\u4E00-\u9FA5]+');
  str.split('').forEach((letter, i) => {
    if (currentWidth > maxWidth) return;
    if (pattern.test(letter)) {
      // 中文字符
      currentWidth += fontSize;
    } else {
      // 根据字体大小获取单个字母的宽度
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    if (currentWidth > maxWidth) {
      res = `${str.slice(0, i)}\n${superLongTextHandle(
        str.slice(i),
        maxWidth,
        fontSize,
      )}`;
    }
  });
  return res;
};
