import { IUiApi } from 'umi-types';

const defaultNameArray = ['Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];

const getNewName = (name: string, index: number = 0) => {
  return `${name}${defaultNameArray[index]}`;
};

/**
 * 获取一个未定义的变量名
 * @param name
 * @param path
 * @param param2
 */
export const getNoExitVar = async ({
  api,
  name,
  path,
  defaultName,
  index = 0,
}: {
  name: string;
  path: string;
  defaultName?: string;
  api: IUiApi;
  index?: number;
}) => {
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
