import { callRemote, listenRemote } from '@/socket';

export async function fetchProject() {
  return callRemote({ type: '@@project/list' });
}

export async function importProject(payload) {
  return callRemote({
    type: '@@project/add',
    payload,
  });
}

export async function setCurrentProject(payload) {
  return callRemote({
    type: '@@project/setCurrentProject',
    payload,
  });
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

export async function createProject(payload, ...params) {
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
