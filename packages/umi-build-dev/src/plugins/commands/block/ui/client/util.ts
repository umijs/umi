import { IUiApi } from 'umi-types';

const defaultNameArray = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];

const getNewName = (name: string, index: number = 0) => {
  return `${name}${defaultNameArray[index]}`;
};

/**
 * 获取一个未定义的变量名
 * @param param2
 */
export const getNoExitVar = async ({
  api,
  name,
  path,
  defaultName,
  index = 0,
  need = true,
}: {
  name: string;
  path: string;
  defaultName?: string;
  api: IUiApi;
  index?: number;
  need?: boolean;
}) => {
  if (!need) {
    return name;
  }
  try {
    const { exists } = (await api.callRemote({
      type: 'org.umi.block.checkBindingInFile',
      payload: {
        path,
        name,
      },
    })) as { exists: boolean };

    if (index < 6 && exists) {
      return getNoExitVar({
        name: getNewName(defaultName || name, index),
        path,
        api,
        defaultName: defaultName || name,
        index: index + 1,
      });
    }
    return name;
  } catch (error) {
    // no thing
  }

  return name;
};

/**
 * 获取未定义的路由
 * @param param0
 */
export const getNoExitRoute = async ({
  api,
  path,
  defaultPath,
  index = 0,
  need = true,
}: {
  path: string;
  defaultPath?: string;
  api: IUiApi;
  index?: number;
  // 有时候没有必要进行这个操作，这个参数返回默认值
  need?: boolean;
}) => {
  if (!need) {
    return path;
  }

  try {
    const { exists } = (await api.callRemote({
      type: 'org.umi.block.checkExistRoute',
      payload: {
        path: path.toLowerCase(),
      },
    })) as {
      exists: boolean;
    };
    if (index < 6 && exists) {
      const fileArray = (defaultPath || path).split('/');
      const name = fileArray.pop();
      const filePath = fileArray.join('/') || '/';
      return getNoExitRoute({
        path: `${filePath}/${getNewName(name, index)}`.replace(/\/\//g, '/'),
        api,
        defaultPath: defaultPath || path,
        index: index + 1,
      });
    }
    return path;
  } catch (error) {
    // no thing
  }

  return path;
};

/**
 * 获取未定义的文件列表
 * @param param0
 */
export const getNoExitPath = async ({
  api,
  path,
  defaultPath,
  index = 0,
  need = true,
}: {
  path: string;
  defaultPath?: string;
  api: IUiApi;
  index?: number;
  // 有时候没有必要进行这个操作，这个参数返回默认值
  need?: boolean;
}) => {
  if (!need) {
    return path;
  }

  try {
    const { exists } = (await api.callRemote({
      type: 'org.umi.block.checkExistFilePath',
      payload: {
        path,
      },
    })) as {
      exists: boolean;
    };

    if (index < 6 && exists) {
      const fileArray = (defaultPath || path).split('/');
      const name = fileArray.pop();
      const filePath = fileArray.join('/') || '/';
      return getNoExitPath({
        path: `${filePath}/${getNewName(name, index)}`.replace(/\/\//g, '/'),
        api,
        defaultPath: defaultPath || path,
        index: index + 1,
      });
    }
    return path;
  } catch (error) {
    // no thing
  }

  return path;
};
