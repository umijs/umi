import React from 'react';
import { IUi } from 'umi-types';
import { FormInstance } from 'antd/lib/form/util';
import StringComp from './String';
import StringArrayComp from './StringArray';
import BooleanComp from './Boolean';
import ObjectComp from './Object';
import ObjectArrayComp from './ObjectArray';
import ListComp from './List';
import TextAreaComp from './TextArea';
import AnyComp from './Any';
import Label from './label';

export type IConfigTypeMapping = { [x in IUi.IConfigTypes]: any };

const configTypeMapping: IConfigTypeMapping = {
  string: StringComp,
  'string[]': StringArrayComp,
  boolean: BooleanComp,
  object: ObjectComp,
  'object[]': ObjectArrayComp,
  list: ListComp,
  textarea: TextAreaComp,
  any: AnyComp,
};

const Field: React.SFC<IUi.IFieldProps> = ({ type, label, ...restProps }) => {
  const ConfigItem = configTypeMapping[type] || configTypeMapping.any;
  const fieldLabel = typeof label === 'object' ? <Label {...label} /> : label;
  return <ConfigItem label={fieldLabel} {...restProps} />;
};

export default Field;
