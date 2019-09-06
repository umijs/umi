import React from 'react';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';
import Context from '@/layouts/Context';
import styles from './styles.module.less';

interface ILabelProps {
  name: string;
  title: string;
  description?: string;
  link?: string;
}

const Label: React.SFC<ILabelProps> = ({ name, title, description, link }) => {
  const { theme } = React.useContext(Context);
  const wrapCls = cls(styles.label, styles[`label-${theme}`]);

  return (
    <div className={wrapCls} id={name}>
      <span>{title}</span>
      {(description || link) && (
        <p>
          {description}{' '}
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer">
              {formatMessage({ id: 'org.umi.ui.configuration.detail' })}
            </a>
          )}
        </p>
      )}
    </div>
  );
};

export default Label;
