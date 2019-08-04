import * as React from 'react';
import { Icon, Breadcrumb } from 'antd';
import cls from 'classnames';
import { getCwd, listDirectory } from '@/services/project';
import DirectoryItem, { DirectoryItemProps } from './item';

import styles from './index.less';

const { useState, useEffect } = React;

interface DirectoryFormProps {
  /** path / cwd */
  value?: string;
  onChange?: (value: string) => void;
}

const DirectoryForm: React.FC<DirectoryFormProps> = props => {
  const { value, onChange } = props;
  const [dirPath, setDirPath] = useState<string>(value || '');
  const [directories, setDirectories] = useState<DirectoryItemProps[]>([]);
  const triggerChangeValue = (path: string) => {
    if (onChange) {
      onChange(path);
    }
  };

  const pathArr = dirPath.split('/');

  const changeDirectories = async (path: string): void => {
    const { data: files } = await listDirectory({
      dirPath: path,
    });
    triggerChangeValue(path);
    setDirPath(path);
    setDirectories(files);
  };

  useEffect(() => {
    (async () => {
      const { cwd } = await getCwd();
      const currDirPath = dirPath || cwd;
      await changeDirectories(currDirPath);
    })();
  }, []);

  const handleDirectoryClick = async (folderName?: string) => {
    if (folderName) {
      // TODO windows Path format
      const currDirPath = `${dirPath}/${folderName}`;
      await changeDirectories(currDirPath);
    }
  };
  const handleParentDirectory = async () => {
    const currDirPath = pathArr.slice(0, -1).join('/');
    await changeDirectories(currDirPath);
  };

  const handleBreadDirChange = async (i: number) => {
    const currDirPath = pathArr.slice(0, i + 1).join('/');
    await changeDirectories(currDirPath);
  };
  return (
    <div className={styles.directoryForm}>
      <div className={styles['directoryForm-toolbar']}>
        <Icon
          type="arrow-left"
          className={styles['directoryForm-toolbar-back']}
          onClick={handleParentDirectory}
        />
        <Breadcrumb className={styles['directoryForm-toolbar-bread']}>
          {pathArr.map((path, i) => (
            <Breadcrumb.Item onClick={() => i !== pathArr.length - 1 && handleBreadDirChange(i)}>
              {path}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        {/* <p>路径：{dirPath}</p> */}
      </div>
      <div className={styles['directoryForm-list']}>
        {directories.map(item => (
          <DirectoryItem key={item.fileName} {...item} onClick={handleDirectoryClick} />
        ))}
      </div>
    </div>
  );
};

export default DirectoryForm;
