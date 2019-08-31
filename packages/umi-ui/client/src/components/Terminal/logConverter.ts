/*eslint-disable*/
// ANSI write
// https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
// http://jafrog.com/2013/11/23/colors-in-terminal.html
// Add custom color support
// Accepts R,G,B or hex color

const color = (r: string | number, g: string | number | undefined, b: string | number) => {
  // if g is undefined, assume r is a hex value
  if (g === undefined) {
    var hex = parseInt(r, 16);
    r = hex >> 16;
    g = (hex >> 8) & 0xff;
    b = hex & 0xff;
  }
  return '\x1B[38;2;' + r + ';' + g + ';' + b + 'm' + this + '\x1B[39m';
};

const bgColor = function(r: string | number, g: string | number | undefined, b: string | number) {
  // if g is undefined, assume r is a hex value
  if (g === undefined) {
    var hex = parseInt(r, 16);
    r = hex >> 16;
    g = (hex >> 8) & 0xff;
    b = hex & 0xff;
  }
  return '\x1B[48;2;' + r + ';' + g + ';' + b + 'm' + this + '\x1B[49m';
};

type IType = 'text' | 'bg';

export default {
  error: (text: string, type: IType = 'bg') => {
    return (type === 'bg' ? bgColor : color).call(text, 240, 64, 52);
  },

  info: (text: string, type: IType = 'bg') => {
    return (type === 'bg' ? bgColor : color).call(text, 24, 144, 255);
  },
};
