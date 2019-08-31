import * as React from 'react';
import { Icon } from '@ant-design/compatible';
import { formatMessage, FormattedMessage, setLocale } from 'umi-plugin-react/locale';
import { Col, Row, Card } from 'antd';
import cls from 'classnames';

import styles from './index.less';

const { useState, useEffect } = React;

type IValue<T = string | number> = T;

export interface IOption {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  link?: React.ReactNode;
  value: IValue;
}

interface CardFormProps {
  gutter?: number | object;
  span?: number;
  options: IOption[];
  value?: IValue;
  onChange?: (value: IValue) => void;
}

const CardForm: React.SFC<CardFormProps> = props => {
  const { value, options, gutter = 16, span = 12, onChange } = props;
  const [{ value: defaultCardValue }] = options || [];
  const [cardValue, setCardValue] = useState<IValue>(value || defaultCardValue);

  const changeCardValue = (v: IValue) => {
    setCardValue(v);
    if (onChange) {
      onChange(v);
    }
  };

  useEffect(() => {
    changeCardValue(value || defaultCardValue);
  }, []);

  const Title = ({ icon, title }) => {
    return (
      <p>
        {React.isValidElement(icon) ? icon : <Icon type={icon || 'appstore'} />}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </p>
    );
  };

  const Description = ({ description, link }) => {
    return (
      <p>
        {description}&nbsp;
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer">
            {formatMessage({ id: 'org.umi.ui.global.project.create.steps.info.template.detail' })}
          </a>
        )}
      </p>
    );
  };

  const handleClick = (val: IValue) => {
    setCardValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <Row gutter={gutter}>
      {Array.isArray(options) &&
        options.map(option => {
          const cardCls = cls(styles['cardForm-card'], {
            [styles.active]: option.value === cardValue,
          });
          return (
            <Col span={span} key={option.value} className={styles['cardForm-col']}>
              <Card className={cardCls} onClick={() => handleClick(option.value)} bordered={false}>
                <Card.Meta
                  title={<Title icon={option.icon} title={option.title} />}
                  description={<Description description={option.description} link={option.link} />}
                />
              </Card>
            </Col>
          );
        })}
    </Row>
  );
};

export default CardForm;
