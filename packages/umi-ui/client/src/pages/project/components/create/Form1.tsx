import * as React from 'react';
import { Form, Input, Button } from 'antd';
import debounce from 'lodash/debounce';
import { IStepItemForm } from '@/components/StepForm/StepItem';
import DirectoryForm from '@/components/DirectoryForm';
import { checkDirValid } from '@/services/project';
import { isValidFolderName } from '@/utils/isValid';
import ProjectContext from '@/layouts/ProjectContext';
import styles from './index.less';

const { useState, useEffect, useContext, forwardRef } = React;

const Form1: React.FC<IStepItemForm> = (props, ref) => {
  const { cwd, goNext, goPrev, style } = props;
  const { formatMessage } = useContext(ProjectContext);
  const [form] = Form.useForm();

  // const handleBaseDirChange = (value: string) => {
  //   const name = form.getFieldValue('name') ? form.getFieldValue('name') : '';
  //   const dir = `${value.endsWith('/') ? value : `${value}/`}${name}`;
  //   form.setFieldsValue({
  //     fullPath: dir,
  //   });
  //   setFullPath(dir);
  // };

  // const handleProjectName = e => {
  //   const basename = fullPath
  //     .split('/')
  //     .slice(0, -1)
  //     .join('/');
  //   const dir = `${basename.endsWith('/') ? basename : `${basename}/`}${e.target.value}`;
  //   form.setFieldsValue({
  //     fullPath: dir,
  //   });
  //   setFullPath(dir);
  // };

  const getFullPath = (fields = {}) => {
    const { name = form.getFieldValue('name'), baseDir = form.getFieldValue('baseDir') } = fields;
    const dir = `${baseDir.endsWith('/') ? baseDir : `${baseDir}/`}${name || ''}`;
    return dir;
  };

  const renderFullPath = () => {
    return <p className={styles.fullPath}>{getFullPath()}</p>;
  };

  const handleDebounceInput = debounce(() => {
    form.validateFields();
  }, 500);

  return (
    <Form
      form={form}
      ref={ref}
      style={style}
      layout="vertical"
      name="form_create_project"
      onFinish={() => goNext()}
      initialValues={{
        baseDir: cwd,
      }}
    >
      <Form.Item label={null} name="baseDir">
        <DirectoryForm />
      </Form.Item>
      <Form.Item
        name="name"
        dependencies={['baseDir']}
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
        rules={[
          { required: true, message: formatMessage({ id: '请输入应用名' }) },
          {
            validateTrigger: 'onBlur',
            validator: async (rule, value) => {
              if (!value) {
                return;
              }
              if (!isValidFolderName(value)) {
                throw new Error(formatMessage({ id: '文件名无效' }));
              } else {
                await checkDirValid({ dir: getFullPath({ name: value }) });
              }
            },
          },
        ]}
      >
        <Input placeholder="请输入应用名" onChange={handleDebounceInput} />
      </Form.Item>
      <Form.Item shouldUpdate>{renderFullPath}</Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          {formatMessage({ id: '下一步' })}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default forwardRef(Form1);
