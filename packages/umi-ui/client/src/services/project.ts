import { router } from 'umi';
import { message } from 'antd';
import { IUi } from 'umi-types';
import { callRemote, listenRemote } from '@/socket';
import { IProjectList } from '@/enums';

export async function fetchProject(action?: Pick<IUi.IAction<object, IProjectList>, 'onProgress'>) {
  return callRemote({ type: '@@project/list', ...action });
}

export async function importProject(payload) {
  return callRemote({
    type: '@@project/add',
    payload,
  });
}

export async function setCurrentProject(payload: { key: string }) {
  try {
    await callRemote({
      type: '@@project/setCurrentProject',
      payload,
    });
    router.push('/dashboard');
    document.getElementById('root').innerHTML = '正在跳转到项目页...';
    window.location.reload();
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

export async function openProjectInEditor(payload) {
  return callRemote({
    type: '@@project/openInEditor',
    payload,
  });
}

export async function createProject(payload, params?: object) {
  console.log('paramsparamsparams', params);
  return callRemote({
    type: '@@project/create',
    payload,
    ...params,
  });
}

export async function editProject(payload) {
  return callRemote({
    type: '@@project/edit',
    payload,
  });
}

export async function getCwd() {
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
