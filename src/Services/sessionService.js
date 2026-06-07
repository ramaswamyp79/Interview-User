// Services/sessionService.js
import api from "../utils/axiosInstance";

const noCacheHeaders = {
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const getFreshParams = (forceFresh = false) => {
  return forceFresh ? { _fresh: Date.now() } : {};
};

export const createSession = async (payload) => {
  const { data } = await api.post("/sessions", payload);
  return data;
};

export const listSessions = async (
  page = 1,
  limit = 6,
  query = "",
  company = "",
  status = "all",
  sort = "newest",
  options = {}
) => {
  const { data } = await api.get("/sessions", {
    params: {
      page,
      limit,
      q: query,
      company,
      status,
      sort,
      ...getFreshParams(options.forceFresh),
    },
    headers: noCacheHeaders,
  });

  return data;
};

export const getSession = async (id, options = {}) => {
  const { data } = await api.get(`/sessions/${id}`, {
    params: getFreshParams(options.forceFresh),
    headers: noCacheHeaders,
  });

  return data;
};

export const updateSession = async (id, payload) => {
  const { data } = await api.put(`/sessions/${id}`, payload);
  return data;
};

export const deleteSession = async (id) => {
  const { data } = await api.delete(`/sessions/${id}`);
  return data;
};

export const connectSession = async (id, payload = {}) => {
  const { data } = await api.post(`/sessions/${id}/connect`, payload);
  return data;
};

export const endSession = async (id, endAt) => {
  const { data } = await api.post(`/sessions/${id}/end`, { endAt });
  return data;
};

export const duplicateSession = async (id) => {
  const { data } = await api.post(`/sessions/${id}/duplicate`);
  return data;
};

export default {
  createSession,
  listSessions,
  getSession,
  updateSession,
  deleteSession,
  connectSession,
  endSession,
  duplicateSession,
};