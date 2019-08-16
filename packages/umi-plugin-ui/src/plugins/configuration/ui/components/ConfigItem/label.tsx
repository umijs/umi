import React from 'react';
import cls from 'classnames';
import Context from '../../Context';
import styles from './styles.module.less';

interface ILabelProps {
  name: string;
  description?: string;
}

const Label: React.SFC<ILabelProps> = ({ name, description }) => {
  const { theme } = React.useContext(Context);
  const wrapCls = cls(styles.label, styles[`label-${theme}`]);

  return (
    <div className={wrapCls}>
      <span>{name}</span>
      {description && <p>{description}</p>}
    </div>
  );
};

export default Label;
