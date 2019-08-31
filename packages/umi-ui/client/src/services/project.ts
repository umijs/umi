import { message } from 'antd';
import { IUi } from 'umi-types';
import { callRemote, listenRemote } from '@/socket';
import { IProjectList } from '@/enums';

export async function fetchProject(action?: Pick<IUi.IAction<object, IProjectList>, 'onProgress'>) {
  return callRemote({ type: '@@project/list', keep: true, ...action });
}

export async function importProject(payload) {
  return callRemote({
    type: '@@project/add',
    payload,
  });
}

export async function setCurrentProject(payload: { key: string }) {
  try {
    // for active immediately, set active asynchronous
    await callRemote({
      type: '@@project/setCurrentProject',
      payload,
    });
  } catch (e) {
    message.error(e.message);
  }
}

export async function deleteProject(payload) {
  return callRemote({
    type: '@@project/delete',
    payload,
  });
}

export async function openInEditor(payload: { key: string }) {
  return callRemote({
    type: '@@project/openInEditor',
    payload,
  });
}

export async function createProject(payload, params?: object) {
  return callRemote({
    type: '@@project/create',
    payload,
    ...params,
  });
}

export function listenCreateProject(params) {
  return listenRemote({
    type: '@@project/create/progress',
    ...params,
  });
}

export async function editProject(payload) {
  return callRemote({
    type: '@@project/edit',
    payload,
  });
}

export async function getCwd(): { cwd: string } {
  return callRemote({ type: '@@fs/getCwd' });
}

export async function listDirectory(payload) {
  return callRemote({
    type: '@@fs/listDirectory',
    payload,
  });
}

export async function checkDirValid(payload: { dir: string }) {
  return callRemote({
    type: '@@project/checkDirValid',
    payload,
  });
}

export async function getNpmClients(): Promise<{ data: string[] }> {
  return callRemote({
    type: '@@project/getNpmClients',
  });
}

interface IDepsPayload {
  npmClient?: string;
  projectPath: string;
}

export async function openConfigFile(
  payload: {
    projectPath: string;
  },
  params = {},
): Promise<any> {
  return callRemote({
    type: '@@actions/openConfigFile',
    payload,
  });
}

export async function openProjectInEditor(
  payload: {
    projectPath: string;
  },
  params = {},
): Promise<any> {
  return callRemote({
    type: '@@actions/openProjectInEditor',
    payload,
  });
}

export async function installDependencies(payload: IDepsPayload, params = {}): Promise<any> {
  return callRemote({
    type: '@@actions/installDependencies',
    payload,
    ...params,
  });
}

export async function reInstallDependencies(payload: IDepsPayload, params = {}): Promise<any> {
  return callRemote({
    type: '@@actions/reInstallDependencies',
    payload,
    ...params,
  });
}
