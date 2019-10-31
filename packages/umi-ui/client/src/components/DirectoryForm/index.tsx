import * as React from 'react';
import { Left, Edit, Reload } from '@ant-design/icons';
import slash2 from 'slash2';
import { Button, Empty, Spin, Input, message, Tooltip } from 'antd';
import { IUi } from 'umi-types';
import { formatMessage } from 'umi-plugin-react/locale';
import { getCwd, listDirectory } from '@/services/project';
import debug from '@/debug';
import { path2Arr, arr2Path, trimSlash } from './pathUtils';
import emptyImg from './emptyImg.png';
import DirectoryItem, { DirectoryItemProps } from './item';

import styles from './index.less';

const { useState, useEffect, useRef } = React;

const DirectoryForm: React.FC<IUi.IDirectoryForm> = props => {
  const _log = debug.extend('DirectoryForm');
  const { value: originValue, onChange } = props;
  const value = slash2(originValue || '');
  const [dirPathEdit, setDirPathEdit] = useState<boolean>(false);
  const dirPathEditRef = useRef<HTMLInputElement>();
  const [clicked, setClicked] = useState<number>(-1);
  const [dirPath, setDirPath] = useState<string>(value || '');
  const [directories, setDirectories] = useState<DirectoryItemProps[]>();
  const triggerChangeValue = (path: string) => {
    if (onChange) {
      onChange(path);
    }
  };

  _log('dirPath', dirPath);
  const pathArr = path2Arr(dirPath);

  const changeDirectories = async (path: string): Promise<boolean> => {
    try {
      const { data: files } = await listDirectory({
        dirPath: path,
      });
      _log('changeDirectories path:', path);
      _log('changeDirectories files:', files);
      triggerChangeValue(path);
      setDirPath(path);
      setDirectories(files);
      setClicked(-1);
      return true;
    } catch (e) {
      _log('changeDirectories error', e);
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      const { cwd } = await getCwd();
      const currDirPath = dirPath || cwd;
      await changeDirectories(currDirPath);
    })();
  }, []);

  const dirPathArr = path2Arr(dirPath);

  // double click
  const handleDirectoryClick = async (folderName?: string) => {
    _log(`doubleClick: ${folderName}`);
    if (folderName) {
      // TODO windows Path format
      const currDirPath = trimSlash(`${dirPath === '/' ? dirPath : `${dirPath}/`}${folderName}`);
      _log(`doubleClick: currDirPath ${currDirPath}`);
      await changeDirectories(currDirPath);
    }
  };

  // single click
  const handleDirectorySelect = (folderName: string, i: number) => {
    _log(`singleClick: ${folderName}`);
    _log('dirPathArr', dirPathArr);
    if (folderName) {
      _log('clicked', !(clicked > -1));
      _log(`dirPath: ${dirPath}`);
      const currDirPath = !(clicked > -1)
        ? `${dirPath === '/' ? dirPath : `${dirPath}/`}${folderName}`
        : arr2Path(dirPathArr.concat(folderName));
      _log(`singleClick: currDirPath ${currDirPath}`);
      triggerChangeValue(currDirPath);
      setClicked(i);
    }
  };

  const handleParentDirectory = async () => {
    if (pathArr.length > 0) {
      const currDirPath = arr2Path(pathArr.slice(0, -1));
      await changeDirectories(currDirPath);
    }
  };

  const handleBreadDirChange = async (path: string) => {
    // TODO: validate Path
    if (path) {
      await changeDirectories(path);
    }
  };

  const handleReload = async () => {
    await changeDirectories(dirPath);
  };

  const handleInputDirPath = async (e: any) => {
    // TODO: validate Path
    if (e.target.value) {
      const inputValue = trimSlash(e.target.value);
      const isValid = await changeDirectories(inputValue);
      if (isValid) {
        setDirPathEdit(false);
      } else {
        message.error(formatMessage({ id: 'org.umi.ui.global.dirform.input.required' }));
      }
    }
  };

  const handleEdit = () => {
    setDirPathEdit(isDirPathEdit => !isDirPathEdit);
    // 延迟执行，拿到 ref
    setTimeout(() => {
      if (dirPathEditRef.current) {
        if (dirPathEdit) {
          // editable => not editable
          dirPathEditRef.current.focus();
        } else {
          dirPathEditRef.current.blur();
        }
      }
    }, 0);
  };

  _log('dirPathArr:', dirPathArr);

  return (
    <div className={styles.directoryForm}>
      <div className={styles['directoryForm-toolbar']}>
        <Button className={styles['directoryForm-toolbar-back']} onClick={handleParentDirectory}>
          <Left onClick={handleParentDirectory} />
        </Button>
        <div className={styles['directoryForm-toolbar-bread']}>
          {dirPathEdit ? (
            <Input
              ref={dirPathEditRef}
              defaultValue={dirPath}
              onBlur={handleInputDirPath}
              onPressEnter={handleInputDirPath}
            />
          ) : (
            dirPathArr.map((path, j) => (
              <Tooltip title={dirPathArr.length > 7 ? path : null} key={j.toString()}>
                <Button
                  key={`${path}_${j}`}
                  onClick={() => handleBreadDirChange(arr2Path(dirPathArr.slice(0, j + 1)))}
                >
                  {path}
                </Button>
              </Tooltip>
            ))
          )}
        </div>
        {/* <Row type="flex" className={styles['directoryForm-toolbar-bread']}>
          {pathArr.map((path, i) => (
            <Col key={path} onClick={() => handleBreadDirChange(i)}>
              <p className={styles['directoryForm-toolbar-bread-path']}>{path}</p>
            </Col>
          ))}
        </Row> */}
        <div className={styles.edit}>
          <Tooltip title={formatMessage({ id: 'org.umi.ui.global.project.directory.edit' })}>
            <Button onClick={handleEdit}>
              <Edit />
            </Button>
          </Tooltip>
        </div>
        <Tooltip title={formatMessage({ id: 'org.umi.ui.global.project.directory.refresh' })}>
          <div className={styles.refresh}>
            <Button onClick={handleReload}>
              <Reload />
            </Button>
          </div>
        </Tooltip>
      </div>
      {Array.isArray(directories) ? (
        <>
          <div className={styles['directoryForm-list']}>
            {directories.length > 0 ? (
              directories.map((item, i) => (
                <DirectoryItem
                  {...item}
                  key={`${item.fileName}_${i}`}
                  clicked={i === clicked}
                  onDoubleClick={handleDirectoryClick}
                  onClick={folderName => handleDirectorySelect(folderName, i)}
                />
              ))
            ) : (
              <div className={styles.empty}>
                <Empty
                  image={emptyImg}
                  description={formatMessage({
                    id: 'org.umi.ui.global.project.create.steps.info.empty',
                  })}
                />
              </div>
            )}
          </div>
          <p className={styles['directoryForm-tip']}>
            {formatMessage({ id: 'org.umi.ui.global.project.directory.tip' })}
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <Spin />
        </div>
      )}
    </div>
  );
};

export default DirectoryForm;
