import * as React from 'react';
import { Select, Spin } from 'antd';
import useNpmClients from '@/components/hooks/useNpmClients';

const { Option } = Select;

export interface INpmClientFormProps {
  placeholder?: string;
  loadingComponent?: React.ReactNode;
  notFoundComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

const NpmClientForm: React.SFC<INpmClientFormProps> = (props = {}) => {
  const {
    placeholder = '请选择包管理器',
    loadingComponent = <Spin size="small" />,
    notFoundComponent = <p>没有包管理器</p>,
    errorComponent = <p>获取包管理器错误</p>,
  } = props;
  const { npmClient, error, loading } = useNpmClients();
  return (
    <Select
      placeholder={placeholder}
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
