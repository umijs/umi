import { style, globalStyle, keyframes } from '@vanilla-extract/css';

globalStyle('body', {
  margin: 0,
  height: '100%',
  fontFamily: `'Lucida Sans', sans-serif`,
});

export const center = style([
  {
    textAlign: 'center',
  },
]);

export const container = style([
  {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
]);

export const title = style([
  {
    fontSize: 32,
  },
]);

export const hoverText = style([
  {
    marginTop: 100,
    padding: 32,
    backgroundColor: '#2eabff',
    fontSize: 24,
    ':hover': {
      color: 'white',
    },
  },
]);

const bounce = keyframes({
  '20%, 53%, 80%': { transform: 'translate3d(0,0,0)' },
  '40%, 43%': { transform: 'translate3d(0, -30px, 0)' },
  '70%': { transform: 'translate3d(0, -15px, 0)' },
  '90%': { transform: 'translate3d(0, -4px, 0)' },
});

export const bounceText = style([
  {
    paddingTop: 100,
    animation: `${bounce} 1s ease infinite`,
  },
]);

export const breakpoints = [576, 768, 992, 1200];

export const medias = breakpoints.map(
  (bp) => `screen and (min-width: ${bp}px)`,
);

export const mediaText = style([
  {
    marginTop: 100,
    color: 'green',
    '@media': {
      [medias[0]]: {
        color: 'hotpink',
      },
      [medias[1]]: {
        color: '#2eabff',
      },
    },
  },
]);
