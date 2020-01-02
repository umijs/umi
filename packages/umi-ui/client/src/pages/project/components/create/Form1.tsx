import * as React from 'react';
import { Form, Input, Button } from 'antd';
import { useDebounceFn } from '@umijs/hooks';
import { IStepItemForm } from 'umi-types/ui';
import { trimSlash, validateDirPath } from '@/components/DirectoryForm/pathUtils';
import DirectoryForm from '@/components/DirectoryForm';
import { checkDirValid } from '@/services/project';
import { isValidFolderName } from '@/utils';
import ProjectContext from '@/layouts/ProjectContext';
import styles from './index.less';

const { useContext, forwardRef } = React;

const Form1: React.FC<IStepItemForm> = (props, ref) => {
  const { cwd, goNext, style } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();
  const { run } = useDebounceFn(() => {
    form.validateFields();
  }, 500);

  const getFullPath = (fields = {}) => {
    const { name = form.getFieldValue('name'), baseDir = form.getFieldValue('baseDir') } = fields;
    const dir = `${(baseDir || '').endsWith('/') ? baseDir : `${baseDir}/`}${name || ''}`;
    return trimSlash(dir || '');
  };

  const renderFullPath = () => {
    return <p className={styles.fullPath}>{getFullPath()}</p>;
  };

  const handlePressEnter = () => {
    form.submit();
  };

  return (
    <Form
      form={form}
      ref={ref}
      style={style}
      onKeyDown={e => (e.keyCode === 13 ? e.preventDefault() : '')}
      layout="vertical"
      name="form_create_project"
      onFinish={() => goNext()}
      initialValues={{
        baseDir: cwd,
      }}
    >
      <Form.Item
        label={null}
        name="baseDir"
        rules={[
          {
            validator: async (rule, value) => {
              await validateDirPath(value);
            },
          },
        ]}
      >
        <DirectoryForm />
      </Form.Item>
      <Form.Item
        name="name"
        dependencies={['baseDir']}
        style={{
          marginBottom: 2,
        }}
        required={false}
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
        rules={[
          {
            required: true,
            message: formatMessage({
              id: 'org.umi.ui.global.project.create.steps.input.placeholder',
            }),
          },
          {
            validateTrigger: 'onBlur',
            validator: async (rule, value) => {
              if (!value) {
                return;
              }
              if (!isValidFolderName(value)) {
                throw new Error(
                  formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.error' }),
                );
              } else {
                await checkDirValid({ dir: getFullPath({ name: value }) });
              }
            },
          },
        ]}
      >
        <Input
          placeholder={formatMessage({
            id: 'org.umi.ui.global.project.create.steps.input.placeholder',
          })}
          onChange={run}
          onPressEnter={handlePressEnter}
          autoComplete="off"
        />
      </Form.Item>
      <Form.Item shouldUpdate>{renderFullPath}</Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          {formatMessage({ id: 'org.umi.ui.global.steps.next' })}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default forwardRef(Form1);
