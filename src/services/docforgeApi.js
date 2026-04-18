import axios from 'axios';

import { API_BASE_URL } from './api';

const base = `${API_BASE_URL}/api/docforge`;

export const listSessions = async () => {
  const r = await axios.get(`${base}/sessions/`);
  return r.data;
};

export const getSession = async (id) => {
  const r = await axios.get(`${base}/sessions/${id}/`);
  return r.data;
};

export const deleteSession = async (id) => {
  await axios.delete(`${base}/sessions/${id}/`);
};

export const uploadFile = async ({ file, privacyMode, templatePack }) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('privacy_mode', privacyMode);
  fd.append('template_pack', templatePack);
  const r = await axios.post(`${base}/upload/`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return r.data;
};

export const updateRecord = async (recordId, data) => {
  const r = await axios.patch(`${base}/records/${recordId}/`, { data });
  return r.data;
};

export const generateDocuments = async (sessionId) => {
  const r = await axios.post(`${base}/sessions/${sessionId}/generate/`);
  return r.data;
};

export const zipDownloadUrl = (sessionId) =>
  `${base}/sessions/${sessionId}/download/`;

export const documentDownloadUrl = (documentId) =>
  `${base}/documents/${documentId}/download/`;

export const listPacks = async () => {
  const r = await axios.get(`${base}/packs/`);
  return r.data;
};
