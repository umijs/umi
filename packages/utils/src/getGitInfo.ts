import * as execa from '../compiled/execa';

export interface GitInfo {
  username: string;
  email: string;
}

const getGitInfo = async (): Promise<GitInfo> => {
  try {
    const [{ stdout: username }, { stdout: email }] = await Promise.all([
      execa.execaCommand('git config --global user.name'),
      execa.execaCommand('git config --global user.email'),
    ]);
    return { username, email };
  } catch (e) {
    return {
      username: '',
      email: '',
    };
  }
};

export default getGitInfo;
