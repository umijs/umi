export const getScrollOffsets = () => {
  if (window.pageXOffset != null) {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset,
    };
  }

  // For IE (or any browser) in Standards mode
  const { document } = window;
  if (document.compatMode === 'CSS1Compat') {
    return {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    };
  }

  return {
    x: document.body.scrollLeft,
    y: document.body.scrollTop,
  };
};

export const getClientHeight = () => {
  let clientHeight = 0;
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    clientHeight =
      document.body.clientHeight < document.documentElement.clientHeight
        ? document.body.clientHeight
        : document.documentElement.clientHeight;
  } else {
    clientHeight =
      document.body.clientHeight > document.documentElement.clientHeight
        ? document.body.clientHeight
        : document.documentElement.clientHeight;
  }
  return clientHeight;
};

export const getClientWidth = () => {
  if (window.innerWidth) {
    return window.innerWidth;
  }
  return document.body.clientWidth;
};
