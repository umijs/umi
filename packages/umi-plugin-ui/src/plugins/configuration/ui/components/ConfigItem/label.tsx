import React from 'react';
import cls from 'classnames';
import Context from '../../Context';
import styles from './styles.module.less';

interface ILabelProps {
  name: string;
  title: string;
  description?: string;
}

const Label: React.SFC<ILabelProps> = ({ name, title, description }) => {
  const { theme } = React.useContext(Context);
  const wrapCls = cls(styles.label, styles[`label-${theme}`]);

  return (
    <div className={wrapCls} id={name}>
      <span>{title}</span>
      {description && <p>{description}</p>}
    </div>
  );
};

export default Label;
