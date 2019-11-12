import * as React from 'react';
import { Select, Spin } from 'antd';
import useNpmClients from '@/components/hooks/useNpmClients';

const { Option } = Select;
const { useState } = React;

export interface INpmClientFormProps {
  placeholder?: string;
  loadingComponent?: React.ReactNode;
  notFoundComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  [key: string]: any;
}

const NpmClientForm: React.SFC<INpmClientFormProps> = (props = {}) => {
  const {
    placeholder = '请选择包管理器',
    loadingComponent = <Spin size="small" />,
    notFoundComponent = <p>没有包管理器</p>,
    errorComponent = <p>获取包管理器错误</p>,
    value,
    onChange,
    ...restProps
  } = props;
  const { npmClient, error, loading } = useNpmClients();

  const handleChange = vv => {
    onChange(vv);
  };

  return (
    <Select
      {...restProps}
      placeholder={placeholder}
      value={value || npmClient[0]}
      onChange={handleChange}
      notFoundContent={loading ? loadingComponent : !npmClient.length && notFoundComponent}
    >
      {error
        ? errorComponent
        : Array.isArray(npmClient) &&
          npmClient.map(client => (
            <Option key={client} value={client}>
              {client}
            </Option>
          ))}
    </Select>
  );
};

export default NpmClientForm;
