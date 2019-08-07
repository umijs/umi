import * as React from 'react';
import { Icon, Button, Empty } from 'antd';
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
  const [directories, setDirectories] = useState<DirectoryItemProps[]>();
  const triggerChangeValue = (path: string) => {
    if (onChange) {
      onChange(path);
    }
  };
  console.log('dirPath', dirPath);
  const pathArr = dirPath === '/' ? [''] : dirPath.split('/');

  const changeDirectories = async (path: string): Promise<void> => {
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
      const currDirPath = `${dirPath === '/' ? dirPath : `${dirPath}/`}${folderName}`;
      await changeDirectories(currDirPath);
    }
  };

  const handleParentDirectory = async () => {
    if (pathArr.length > 0) {
      const currDirPath = pathArr.slice(0, -1).join('/');
      await changeDirectories(currDirPath);
    }
  };

  const handleBreadDirChange = async (i: number) => {
    const currDirPath = pathArr.slice(0, i + 1).join('/') || '/';
    await changeDirectories(currDirPath);
  };

  const handleReload = async () => {
    await changeDirectories(dirPath);
  };

  return (
    <div className={styles.directoryForm}>
      <div className={styles['directoryForm-toolbar']}>
        <Button className={styles['directoryForm-toolbar-back']} onClick={handleParentDirectory}>
          <Icon type="arrow-left" onClick={handleParentDirectory} />
        </Button>
        <div className={styles['directoryForm-toolbar-bread']}>{dirPath}</div>
        {/* <Row type="flex" className={styles['directoryForm-toolbar-bread']}>
          {pathArr.map((path, i) => (
            <Col key={path} onClick={() => handleBreadDirChange(i)}>
              <p className={styles['directoryForm-toolbar-bread-path']}>{path}</p>
            </Col>
          ))}
        </Row> */}
        <Button>
          <Icon type="edit" />
        </Button>
        <Button onClick={handleReload}>
          <Icon type="reload" />
        </Button>
      </div>
      {Array.isArray(directories) && (
        <div className={styles['directoryForm-list']}>
          {directories.length > 0 ? (
            directories.map(item => (
              <DirectoryItem key={item.fileName} {...item} onClick={handleDirectoryClick} />
            ))
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="空目录列表" />
          )}
        </div>
      )}
    </div>
  );
};

export default DirectoryForm;
