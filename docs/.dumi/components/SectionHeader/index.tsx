import styles from './index.less';

export const SectionHeader = (props: { title: string }) => {
  return (
    <div className={styles.section}>
      <div className="section-header-line"></div>
      <h2 className="section-header-title">{props.title}</h2>
      <div className="section-header-line"></div>
    </div>
  );
};
