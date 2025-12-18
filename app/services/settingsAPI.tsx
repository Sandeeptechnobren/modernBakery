import { Params } from "next/dist/server/request/params";
import { API, handleError, APIFormData } from "./APIutils";

export const getBrand = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/brands/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const tierList = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/tiers/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createTier = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/tiers/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getTierDetails = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/tiers/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateTier = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/tiers/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const rewardCategoryList = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/rewards/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createRewardCategory = async (payload: object) => {
  try {
    const res =
      payload instanceof FormData
        ? await APIFormData.post("/api/settings/rewards/create", payload)
        : await API.post("/api/settings/rewards/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getRewardDetails = async (uuid: string) => {
  try {
    const res = await API.get(`api/settings/rewards/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateReward = async (uuid: string, body: object) => {
  try {
    const res =
      body instanceof FormData
        ? await APIFormData.put(`/api/settings/rewards/update/${uuid}`, body)
        : await API.put(`/api/settings/rewards/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const bonusList = async (params: Params) => {
  try {
    const res = await API.get("/api/settings/bonus/list", { params });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const createBonus = async (payload: object) => {
  try {
    const res = await API.post("/api/settings/bonus/create", payload);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const getBonusDetails = async (uuid: string) => {
  try {
    const res = await API.get(`/api/settings/bonus/show/${uuid}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const updateBonus = async (uuid: string, body: object) => {
  try {
    const res = await API.put(`/api/settings/bonus/update/${uuid}`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const orderProcessFlow = async (body: object) => {
  try {
    const res = await API.post(`/api/master/approval/order-process-flow`, body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const auditTrailList = async (params: Params) => {
  try {
    const res = await API.get(`/api/Logs_Audit/logs/list`, {
      params: params,
    });
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};


export const getAuditTrailDetails = async (id: string) => {
  try {
    const res = await API.get(`/api/Logs_Audit/logs/show/${id}`);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};