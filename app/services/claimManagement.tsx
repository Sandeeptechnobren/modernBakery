import { Params } from "next/dist/server/request/params";
import { API, handleError } from "./APIutils";



export const compailedClaimList = async (params?: Params) => {
  try {
    const res = await API.get("/api/claim_management/compiled-claim/list", { params });
    return res.data;
  } catch (error: unknown) { 
    return handleError(error);
  }
};

export const filterCompailedClaim = async (params?: Params) => {
  try {
    const res = await API.get("/api/agent_transaction/invoices/filter", { params });
    return res.data;
  } catch (error: unknown) { 
    return handleError(error);
  }
};

export const createCompailedClaim = async (body?: object) => {
    try {
        const res = await API.post("/api/claim_management/compiled-claim/add", body);
        return res.data;
    } catch (error: unknown) { 
        return handleError(error);
    }
};


export const exportCompailedData = async (params: Params) => {
  try {
    const res = await API.get(`/api/claim_management/compiled-claim/export`, {params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};

export const exportPetitData = async (params: Params) => {
  try {
    const res = await API.get(`/api/claim_management/petit-claim/export`, {params});
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};



export const petitClaimList = async (params?: Params) => {
  try {
    const res = await API.get("/api/claim_management/petit-claim/list", { params });
    return res.data;
  } catch (error: unknown) { 
    return handleError(error);
  }
};
export const createPetitClaim = async (body?: object) => {
  try {
    // detect FormData and post as multipart/form-data
    if (body instanceof FormData) {
      const res = await API.post("/api/claim_management/petit-claim/add", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    const res = await API.post("/api/claim_management/petit-claim/add", body);
    return res.data;
  } catch (error: unknown) {
    return handleError(error);
  }
};
