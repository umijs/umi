import React, { PureComponent } from 'react';
import { FormInstance } from 'antd/lib/form/util';
import StringComp from './String';
import StringArrayComp from './StringArray';
import BooleanComp from './Boolean';
import ObjectComp from './Object';
import ObjectArrayComp from './ObjectArray';
import ListComp from './List';
import TextAreaComp from './TextArea';
import AnyComp from './Any';

export enum CONFIG_TYPES {
  'string' = 'string',
  'string[]' = 'string[]',
  'boolean' = 'boolean',
  'object' = 'object',
  'object[]' = 'object[]',
  'list' = 'list',
  'textarea' = 'textarea',
  'any' = 'any',
}

type IValue = string | object | boolean | string[] | object[];

export interface ICompProps {
  group: string;
  name: string;
  title: string;
  description: string;
  type: IConfigTypes;
  default: IValue;
  choices?: string[];
  value: IValue;
  link?: string;
  /** form ins */
  form: FormInstance;
}

export type IConfigTypes = keyof typeof CONFIG_TYPES;

export type IConfigTypeMapping = { [x in IConfigTypes]: any };

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

export default configTypeMapping;
