import SectionHeader from '@/docs/components/SectionHeader/SectionHeader';
import React from 'react';
// @ts-ignore
import styles from './WhoIsUsing.css';

export default () => {
  return (
    <div className={styles.normal}>
      <SectionHeader title="Who Is Using" />
      <ul>
        <li>
          <img
            alt="Ant Group"
            src="https://img.alicdn.com/imgextra/i4/O1CN01xx0ImZ23tPBygrM12_!!6000000007313-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Alibaba Group"
            src="https://img.alicdn.com/imgextra/i4/O1CN01P96Z6r237lzzfjXNB_!!6000000007209-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Tencent"
            src="https://img.alicdn.com/imgextra/i3/O1CN01DgWUEd1yjGL3Bj2is_!!6000000006614-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="ByteDance"
            src="https://img.alicdn.com/imgextra/i3/O1CN01BjNyqE1YTz7Nhumfv_!!6000000003061-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="NetEase"
            src="https://img.alicdn.com/imgextra/i1/O1CN01CE8hHB1HOAcZnvk3i_!!6000000000747-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Meituan"
            src="https://img.alicdn.com/imgextra/i4/O1CN01iFNTVz1ZosnsLm3Al_!!6000000003242-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Kuaishou"
            src="https://img.alicdn.com/imgextra/i4/O1CN01PsUHHh1RxZOVEeuxC_!!6000000002178-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Pinduoduo"
            src="https://img.alicdn.com/imgextra/i2/O1CN012Ew7Ie1dYdDYjAqlP_!!6000000003748-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="DXY"
            src="https://img.alicdn.com/imgextra/i4/O1CN01UAe7qj1NvxXQ8NNPq_!!6000000001633-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="Haojing Technology"
            src="https://img.alicdn.com/imgextra/i1/O1CN0117cQjM1xTP0eSzDyu_!!6000000006444-2-tps-480-160.png"
          />
        </li>
      </ul>
    </div>
  );
};
