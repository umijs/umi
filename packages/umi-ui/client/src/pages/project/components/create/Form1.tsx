import * as React from 'react';
import { Form, Input, Button } from 'antd';
import cls from 'classnames';
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
  const [fullPath, setFullPath] = useState<string>(cwd);
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

  return (
    <Form
      form={form}
      ref={ref}
      style={style}
      layout="vertical"
      name="form_create_project"
      onFinish={() => goNext()}
      initialValues={{}}
      onValuesChange={(changed, { baseDir, name }) => {
        const dir = `${baseDir.endsWith('/') ? baseDir : `${baseDir}/`}${name || ''}`;
        form.setFieldsValue({
          fullPath: dir,
        });
        setFullPath(dir);
      }}
    >
      <Form.Item label={null} name="baseDir">
        <DirectoryForm />
      </Form.Item>
      <Form.Item
        name="name"
        label={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input.name' })}
        rules={[
          { required: true, message: formatMessage({ id: '请输入应用名' }) },
          {
            validator: async (rule, value) => {
              if (!isValidFolderName(value)) {
                throw new Error(formatMessage({ id: '文件名无效' }));
              }
            },
          },
        ]}
      >
        <Input placeholder="请输入应用名" />
      </Form.Item>
      <Form.Item
        name="fullPath"
        rules={[
          {
            validator: async (rule, value) => {
              try {
                await checkDirValid({ dir: value });
              } catch (e) {
                throw new Error(e.message);
              }
            },
          },
        ]}
      >
        <p className={styles.fullPath}>{fullPath}</p>
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          {formatMessage({ id: '下一步' })}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default forwardRef(Form1);
