import React, { useEffect, useState } from 'react';
import styles from './index.module.less';

const DEFAULT_IMG =
  'https://gw.alipayobjects.com/mdn/rms_4f0d74/afts/img/A*I0RVS41yx2sAAAAAAAAAAABkARQnAQ';

const ImageLoad: React.FC<{
  src: string;
}> = ({ src }) => {
  const [imgSrc, setSrc] = useState<string>(DEFAULT_IMG);
  useEffect(
    () => {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        setSrc(src);
      };
    },
    [src],
  );
  return (
    <div
      className={imgSrc === DEFAULT_IMG ? styles.defaultImg : styles.img}
      style={{
        backgroundImage: `url(${imgSrc})`,
      }}
    />
  );
};

export default ImageLoad;
