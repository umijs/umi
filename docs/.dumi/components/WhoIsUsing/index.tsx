import { SectionHeader } from '../SectionHeader';
import styles from './index.less';

export const WhoIsUsing = () => {
  return (
    <div className={styles.who_is_using}>
      <SectionHeader title="谁在使用" />
      <ul className="using-list">
        <li>
          <img
            alt="蚂蚁集团"
            src="https://img.alicdn.com/imgextra/i4/O1CN01xx0ImZ23tPBygrM12_!!6000000007313-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="阿里巴巴集团"
            src="https://img.alicdn.com/imgextra/i4/O1CN01P96Z6r237lzzfjXNB_!!6000000007209-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="腾讯"
            src="https://img.alicdn.com/imgextra/i3/O1CN01DgWUEd1yjGL3Bj2is_!!6000000006614-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="字节跳动"
            src="https://img.alicdn.com/imgextra/i3/O1CN01BjNyqE1YTz7Nhumfv_!!6000000003061-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="网易"
            src="https://img.alicdn.com/imgextra/i1/O1CN01CE8hHB1HOAcZnvk3i_!!6000000000747-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="美团"
            src="https://img.alicdn.com/imgextra/i4/O1CN01iFNTVz1ZosnsLm3Al_!!6000000003242-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="快手"
            src="https://img.alicdn.com/imgextra/i4/O1CN01PsUHHh1RxZOVEeuxC_!!6000000002178-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="拼多多"
            src="https://img.alicdn.com/imgextra/i2/O1CN012Ew7Ie1dYdDYjAqlP_!!6000000003748-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="丁香园"
            src="https://img.alicdn.com/imgextra/i4/O1CN01UAe7qj1NvxXQ8NNPq_!!6000000001633-2-tps-480-160.png"
          />
        </li>
        <li>
          <img
            alt="浩鲸科技"
            src="https://img.alicdn.com/imgextra/i1/O1CN0117cQjM1xTP0eSzDyu_!!6000000006444-2-tps-480-160.png"
          />
        </li>
      </ul>
    </div>
  );
};
